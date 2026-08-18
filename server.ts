import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "YORVAR CRM Core API",
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // AI Assistant endpoint: generates emails, lead summaries, next best action, or objection handling
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { type, prompt, leadData, context } = req.body;

      if (!ai) {
        // Fallback intelligent response generator if API key is not yet set
        return res.json({
          success: true,
          isFallback: true,
          result: generateHeuristicResponse(type, leadData, prompt, context),
        });
      }

      let systemInstruction = "Eres el copiloto comercial de YORVAR CRM. Tu objetivo es ayudar a SDRs y ejecutivos de cuentas a cerrar más ventas, redactar correos persuasivos, calificar prospectos y sintetizar información comercial en español profesional y directo.";
      
      let fullPrompt = prompt;
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
        model: "gemini-3.7-flash",
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
      // Graceful degradation so the CRM never breaks
      const { type, leadData, prompt, context } = req.body;
      res.json({
        success: true,
        isFallback: true,
        fallbackReason: error.message || "Error al conectar con Gemini API",
        result: generateHeuristicResponse(type, leadData, prompt, context),
      });
    }
  });

  // Webhooks simulation & ingestion endpoints
  app.post("/api/webhooks/leads", (req, res) => {
    const payload = req.body;
    console.log("Incoming Webhook [Leads]:", payload);
    res.json({
      received: true,
      timestamp: new Date().toISOString(),
      leadId: `lead-wh-${Date.now()}`,
      status: "processed",
    });
  });

  app.post("/api/webhooks/email", (req, res) => {
    const event = req.body;
    console.log("Incoming Webhook [Email Event]:", event);
    res.json({
      received: true,
      eventRecorded: event.eventType || "delivery",
      status: "logged",
    });
  });

  app.post("/api/webhooks/whatsapp", (req, res) => {
    const message = req.body;
    console.log("Incoming Webhook [WhatsApp API]:", message);
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
