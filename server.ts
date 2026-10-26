import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic security middleware: capture rawBody for HMAC verification and limit payload size
  app.use(
    express.json({
      limit: "2mb",
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  // Supabase admin/validator client if credentials provided in environment
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

  // Rate Limiting Storage (In-Memory sliding counter: IP -> { count, resetAt })
  // Note: For horizontal multi-instance scaling in production, this should be backed by Redis/Upstash.
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_MAX = 30; // Max 30 requests per minute
  const RATE_LIMIT_WINDOW_MS = 60 * 1000;

  /**
   * Authoritative client IP resolution.
   * Normalizes IPv4-mapped IPv6 without destroying pure IPv6 addresses.
   * Prevents IP spoofing: do not blindly trust raw X-Forwarded-For unless trust proxy is set.
   */
  function getAuthoritativeClientIp(req: Request): string {
    const raw = req.socket.remoteAddress || req.ip || "";
    let ip = raw.trim();

    // Normalize IPv6-mapped IPv4 (::ffff:127.0.0.1 -> 127.0.0.1)
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }

    if (!ip) {
      // Avoid collapsing all unresolvable sockets into a single shared bucket
      const socketId = (req.socket as any)._handle?.fd || "unresolved";
      return `local-sock-${socketId}`;
    }

    return ip.toLowerCase();
  }

  function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const clientIp = getAuthoritativeClientIp(req);
    const now = Date.now();
    const entry = rateLimitMap.get(clientIp);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    if (entry.count >= RATE_LIMIT_MAX) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        error: "Demasiadas solicitudes. Límite de tasa excedido.",
        retryAfterSeconds: retryAfterSec,
      });
    }

    entry.count += 1;
    next();
  }

  // Authentication Middleware for API Endpoints - Fail-Safe Zero-Trust with DB Role Resolution
  async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Acceso no autorizado. Se requiere encabezado Authorization: Bearer <token>.",
      });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({ error: "Token de autorización inválido o vacío." });
    }

    // Fail-safe: if Supabase credentials are not configured on the backend, do NOT accept fake or fixed tokens!
    if (!supabase) {
      return res.status(503).json({
        error: "Servicio de autenticación no configurado en el servidor backend. Configure las variables SUPABASE_URL y SUPABASE_ANON_KEY para validar sesiones.",
      });
    }

    // Strictly verify JWT against Supabase Auth
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({
          error: "Token de sesión inválido, expirado o manipulado.",
          details: error?.message,
        });
      }

      // Query authoritative user profile from database to determine role and tenant
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id, email, name, role, organization_id, status, custom_permissions")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.status !== "active") {
        return res.status(403).json({
          error: "Acceso denegado: La cuenta de usuario se encuentra inactiva o suspendida.",
        });
      }

      const authoritativeOrgId = profile?.organization_id || (user.user_metadata?.organizationId as string);
      if (!authoritativeOrgId || typeof authoritativeOrgId !== "string" || !authoritativeOrgId.trim()) {
        return res.status(403).json({
          error: "Acceso denegado: El usuario autenticado no posee una organización asignada en su perfil ni en sus metadatos autoritativos.",
        });
      }

      (req as any).user = {
        id: user.id,
        email: user.email,
        role: profile?.role || (user.user_metadata?.role as string) || "vendedor",
        organizationId: authoritativeOrgId.trim(),
        customPermissions: profile?.custom_permissions || [],
        status: profile?.status || "active",
      };

      return next();
    } catch (err: any) {
      return res.status(401).json({ error: "Fallo en la validación criptográfica del token." });
    }
  }

  // Initialize Gemini on the server side
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // --- API Routes ---

  // Health check - Public
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "YORVAR CRM Core API",
      timestamp: new Date().toISOString(),
      supabaseConfigured: !!supabase,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      authEnforced: true,
      rateLimitWindowMinutes: 1,
      rateLimitMaxPerWindow: RATE_LIMIT_MAX,
    });
  });

  // Allowed types for AI Generation
  const ALLOWED_AI_TYPES = [
    "draft_email",
    "summarize_lead",
    "next_best_action",
    "qualify_lead",
    "objection_handling",
    "deal_risk_analysis",
  ];

  // AI Assistant endpoint: protected with authentication, rate limiting, and strict input validation
  app.post("/api/gemini/generate", requireAuth, rateLimiter, async (req: Request, res: Response) => {
    try {
      const { type, prompt, leadData, context } = req.body;

      // 1. Input Validation: Type check
      if (!type || !ALLOWED_AI_TYPES.includes(type)) {
        return res.status(400).json({
          error: `Tipo de operación inválida. Tipos permitidos: ${ALLOWED_AI_TYPES.join(", ")}`,
        });
      }

      // Server-Side RBAC Enforcement on AI generation
      // Ensures users cannot elevate permissions via crafted client payloads
      const userRole = (req as any).user?.role || "vendedor";
      const customPerms: string[] = (req as any).user?.customPermissions || [];

      if (type === "deal_risk_analysis") {
        const canAnalyze =
          userRole === "super_admin" ||
          userRole === "gerente_ventas" ||
          customPerms.includes("reports.view") ||
          customPerms.includes("can_view_analytics");

        if (!canAnalyze) {
          return res.status(403).json({
            error: "Acceso denegado: Se requiere rol directivo (Super Admin, Gerente de Ventas) o permiso de analítica para ejecutar 'deal_risk_analysis'.",
          });
        }
      }

      // 2. Input Validation: Prompt length & content sanitization
      if (prompt && typeof prompt !== "string") {
        return res.status(400).json({ error: "El campo 'prompt' debe ser una cadena de texto." });
      }

      if (prompt && prompt.length > 4000) {
        return res.status(400).json({
          error: "El texto ingresado supera el límite máximo permitido de 4000 caracteres.",
        });
      }

      // Sanitize input: remove null bytes and unsafe control chars
      const sanitizedPrompt = (prompt || "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();

      if (!ai) {
        // Fallback intelligent response generator if API key is not set
        return res.json({
          success: true,
          isFallback: true,
          result: generateHeuristicResponse(type, leadData, sanitizedPrompt, context),
        });
      }

      const systemInstruction =
        "Eres el copiloto comercial de YORVAR CRM. Tu objetivo es ayudar a SDRs y ejecutivos de cuentas a cerrar más ventas, redactar correos persuasivos, calificar prospectos y sintetizar información comercial en español profesional y directo.";

      let fullPrompt = sanitizedPrompt;
      if (type === "draft_email") {
        fullPrompt = `Redacta un correo comercial personalizado para el siguiente prospecto:
Nombre: ${leadData?.name || "Prospecto"} ${leadData?.lastName || ""}
Empresa: ${leadData?.company || "Empresa"}
Cargo: ${leadData?.jobTitle || "Decisor"}
Industria: ${leadData?.industry || "Tecnología"}
Objetivo del correo: ${context?.goal || "Primer contacto / Prospección"}
Tono deseado: ${context?.tone || "Profesional y consultivo"}
Propuesta de valor clave: ${context?.valueProp || "Optimización de procesos comerciales y aumento de conversión"}

Instrucciones:
1. Genera una línea de asunto atractiva (máximo 7 palabras, sin clickbait)
2. Redacta el cuerpo del email (máximo 120 palabras, enfocado en el dolor del prospecto)
3. Incluye un Call to Action (CTA) de baja fricción
4. Devuelve el resultado en formato JSON con las claves: "subject" y "body".`;
      } else if (type === "summarize_lead") {
        fullPrompt = `Analiza y genera un resumen ejecutivo 360° para este prospecto:
Datos: ${JSON.stringify(leadData, null, 2)}
Historial de actividades: ${JSON.stringify(context?.activities || [], null, 2)}

Devuelve un JSON con:
- "summary": resumen en 2 párrafos concisos
- "keyPainPoints": lista de 3 dolores detectados
- "suggestedNextStep": acción recomendada inmediata
- "dealRisk": riesgo estimado (Bajo/Medio/Alto) con justificación breve.`;
      } else if (type === "next_best_action") {
        fullPrompt = `Calcula la "Next Best Action" (Próxima Mejor Acción Comercial) para este prospecto u oportunidad:
Prospecto: ${JSON.stringify(leadData)}
Oportunidad: ${JSON.stringify(context?.opportunity || {})}
Días sin contacto: ${context?.daysWithoutContact || 0}

Devuelve un JSON con:
- "actionTitle": título corto de la acción (ej: "Llamada de reenganche")
- "urgency": "Alta" | "Media" | "Baja"
- "reasoning": por qué se debe hacer hoy (mencionando score, valor y días sin contacto)
- "suggestedScript": guión rápido de 2 frases para iniciar la conversación.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        parsedData = { text: responseText };
      }

      res.json({
        success: true,
        result: parsedData,
        isFallback: false,
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const { type, leadData, prompt, context } = req.body;
      res.json({
        success: true,
        isFallback: true,
        fallbackReason: error.message || "Error al conectar con Gemini API",
        result: generateHeuristicResponse(type, leadData, prompt, context),
      });
    }
  });

  // Webhooks ingestion endpoints: enforce constant-time webhook secret and provider-specific HMAC signature verification
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || process.env.CRM_WEBHOOK_SECRET || "";
  // Isolate provider secrets: WhatsApp webhook secrets MUST NOT fall back to generic shared secrets
  const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";
  const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";

  /**
   * Header-only webhook authenticator.
   * Query string (?secret=...) is strictly disallowed to prevent secret leakage in logs, proxies, and browser histories.
   */
  function verifyWebhookAuth(req: Request, res: Response, next: NextFunction) {
    const providedSecret =
      (req.headers["x-webhook-secret"] as string) ||
      (req.headers["x-api-key"] as string) ||
      "";

    // Fail safe: If secret is not configured in server environment, reject all requests
    if (!WEBHOOK_SECRET) {
      return res.status(503).json({
        error: "Servicio de webhooks deshabilitado: WEBHOOK_SECRET no configurado en el servidor.",
      });
    }

    // Constant-time comparison to prevent timing attacks
    const secretBuf = Buffer.from(WEBHOOK_SECRET);
    const providedBuf = Buffer.from(providedSecret);

    if (secretBuf.length !== providedBuf.length || !crypto.timingSafeEqual(secretBuf, providedBuf)) {
      return res.status(403).json({ error: "Firma o secreto de webhook no válido en encabezados HTTP." });
    }

    next();
  }

  // Leads ingestion webhook
  app.post("/api/webhooks/leads", verifyWebhookAuth, (req, res) => {
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Payload JSON requerido para webhook de leads." });
    }
    console.log("Verified Incoming Webhook [Leads]:", payload);
    res.json({
      received: true,
      timestamp: new Date().toISOString(),
      leadId: `lead-wh-${Date.now()}`,
      status: "processed",
    });
  });

  // Email delivery event webhook (SendGrid, Mailgun, Amazon SES)
  app.post("/api/webhooks/email", verifyWebhookAuth, (req, res) => {
    const event = req.body;
    if (!event || typeof event !== "object") {
      return res.status(400).json({ error: "Payload JSON requerido para webhook de email." });
    }
    console.log("Verified Incoming Webhook [Email Event]:", event);
    res.json({
      received: true,
      eventRecorded: event.eventType || "delivery",
      status: "logged",
    });
  });

  // WhatsApp Meta Cloud API Webhook: GET Verification Handshake (Challenge)
  app.get("/api/webhooks/whatsapp", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (!WHATSAPP_VERIFY_TOKEN) {
      return res.status(503).json({
        error: "Servicio de WhatsApp deshabilitado: WHATSAPP_VERIFY_TOKEN no configurado en el servidor.",
      });
    }

    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      console.log("Meta WhatsApp Webhook subscription challenge verified.");
      return res.status(200).send(challenge);
    }

    return res.status(403).json({
      error: "Fallo en la verificación del token de suscripción de WhatsApp.",
    });
  });

  // WhatsApp Meta Cloud API Webhook: POST Events (Strict HMAC SHA-256 over raw body)
  app.post("/api/webhooks/whatsapp", (req: Request, res: Response) => {
    const hubSignature = (req.headers["x-hub-signature-256"] as string) || "";

    if (!WHATSAPP_APP_SECRET) {
      return res.status(503).json({
        error: "Servicio de WhatsApp deshabilitado: Clave secreta (WHATSAPP_APP_SECRET) no configurada.",
      });
    }

    // Strictly enforce Meta Cloud API specification: header x-hub-signature-256 is required
    if (!hubSignature || !hubSignature.startsWith("sha256=")) {
      return res.status(401).json({
        error: "Acceso no autorizado: Se requiere encabezado 'X-Hub-Signature-256: sha256=<hmac>' conforme al estándar de Meta WhatsApp Cloud API.",
      });
    }

    const rawBodyBuffer = (req as any).rawBody;
    if (!rawBodyBuffer || !Buffer.isBuffer(rawBodyBuffer)) {
      return res.status(500).json({
        error: "Error interno: El cuerpo crudo (rawBody) de la solicitud no está disponible para validar la firma HMAC.",
      });
    }

    const signatureHash = hubSignature.substring(7).trim();
    const computedHash = crypto
      .createHmac("sha256", WHATSAPP_APP_SECRET)
      .update(rawBodyBuffer)
      .digest("hex");

    const expectedBuf = Buffer.from(signatureHash);
    const computedBuf = Buffer.from(computedHash);

    if (expectedBuf.length !== computedBuf.length || !crypto.timingSafeEqual(expectedBuf, computedBuf)) {
      return res.status(403).json({ error: "Firma HMAC X-Hub-Signature-256 no válida." });
    }

    const message = req.body;
    if (!message || typeof message !== "object") {
      return res.status(400).json({ error: "Payload JSON requerido para webhook de WhatsApp." });
    }

    console.log("Verified Incoming Webhook [WhatsApp API]:", message);
    res.json({
      received: true,
      messageId: `wamid-${Date.now()}`,
      status: "queued",
    });
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`YORVAR CRM Server running at http://localhost:${PORT}`);
  });
}

// Heuristic fallback generator when Gemini API Key is pending or offline
function generateHeuristicResponse(type: string, leadData: any, prompt: string, context: any) {
  const name = leadData?.name || "Estimado/a";
  const company = leadData?.company || "su organización";
  const title = leadData?.jobTitle || "Líder de Área";

  if (type === "draft_email") {
    return {
      subject: `Impulso comercial y optimización para ${company}`,
      body: `Hola ${name},\n\nHe estado analizando el crecimiento de ${company} y los desafíos habituales que enfrentan las empresas de su sector en la gestión de prospección y cierre comercial.\n\nEn YORVAR CRM ayudamos a equipos comerciales a reducir en un 35% los ciclos de venta y automatizar el seguimiento sin perder el toque humano.\n\n¿Tendrías 15 minutos este jueves para una llamada exploratoria breve?\n\nSaludos cordiales,`,
    };
  }

  if (type === "summarize_lead") {
    return {
      summary: `${name} (${title} en ${company}) muestra alto interés en soluciones de automatización de ventas. Representa una cuenta de tamaño medio con alto potencial de cierre si se mantiene la cadencia de seguimiento.`,
      keyPainPoints: [
        "Pérdida de trazabilidad en el pipeline de ventas",
        "Seguimiento manual y dispersión de prospectos",
        "Falta de visibilidad de entregabilidad y métricas de prospección",
      ],
      suggestedNextStep: "Agendar demostración ejecutiva enfocada en automatización de secuencias",
      dealRisk: "Bajo",
    };
  }

  if (type === "next_best_action") {
    return {
      actionTitle: "Llamada comercial y propuesta de valor",
      urgency: "Alta",
      reasoning: `Lead con Score de ${leadData?.score || 85} puntos, en ${company}. Lleva varios días sin interacción y abrió los últimos correos de prospección.`,
      suggestedScript: `Hola ${name}, te llamo para dar seguimiento a la información que revisaste sobre optimización de conversiones en ${company}. ¿Pudiste evaluarla con el equipo?`,
    };
  }

  return {
    response: `Análisis generado para ${company}: Se recomienda continuar con la cadencia de seguimiento personalizada y registrar toda interacción en el timeline del CRM.`,
  };
}

startServer();
