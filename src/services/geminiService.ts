export interface GenerateAIOptions {
  type: "draft_email" | "summarize_lead" | "next_best_action" | "qualify_lead" | "objection_handling" | "deal_risk_analysis";
  prompt?: string;
  leadData?: any;
  opportunityData?: any;
  context?: any;
}

export async function requestAIAssistant(options: GenerateAIOptions): Promise<{
  success: boolean;
  result: any;
  isFallback?: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.warn("Client Gemini Assistant call failed, using client-side smart heuristics:", error);
    // Instant client-side fallback
    return {
      success: true,
      isFallback: true,
      result: getClientFallback(options),
    };
  }
}

function getClientFallback(options: GenerateAIOptions) {
  const name = options.leadData?.name || "Estimado/a";
  const company = options.leadData?.company || "su empresa";

  if (options.type === "draft_email") {
    return {
      subject: `Optimización comercial y reducción de ciclos de venta en ${company}`,
      body: `Hola ${name},\n\nHe estado analizando los desafíos frecuentes en ${company} para la prospección y seguimiento oportuno a cotizaciones.\n\nEn YORVAR CRM ayudamos a equipos comerciales B2B a centralizar oportunidades y aumentar en un 35% la tasa de cierre.\n\n¿Tendrías 15 minutos esta semana para una llamada exploratoria?\n\nSaludos cordiales,`,
    };
  }

  if (options.type === "summarize_lead") {
    return {
      summary: `${name} en ${company} presenta alto potencial comercial. Se encuentra en etapa de toma de decisiones y ha interactuado positivamente con la información enviada.`,
      keyPainPoints: [
        "Falta de trazabilidad en el pipeline de ventas",
        "Seguimiento manual y demoras en envío de cotizaciones",
        "Necesidad de auditoría de roles y permisos",
      ],
      suggestedNextStep: "Agendar llamada para resolver dudas técnicas sobre seguridad y entregabilidad",
      dealRisk: "Bajo",
    };
  }

  if (options.type === "next_best_action") {
    return {
      actionTitle: "Llamada comercial y resolución de dudas",
      urgency: "Alta",
      reasoning: `Lead con alto puntaje de interacción (${options.leadData?.score || 85} pts) en ${company}. Requiere seguimiento inmediato antes de su reunión de directiva.`,
      suggestedScript: `Hola ${name}, te llamo para revisar si pudiste chequear la propuesta que enviamos y si requieres información adicional para la evaluación con el equipo.`,
    };
  }

  if (options.type === "deal_risk_analysis") {
    const opp = options.opportunityData || {};
    return {
      riskLevel: opp.probability < 40 ? "Alto" : opp.probability < 70 ? "Medio" : "Bajo",
      summary: `La oportunidad "${opp.title || "Negociación"}" por valor de ${opp.value ? "$" + opp.value.toLocaleString() : "$0"} requiere aceleración en la etapa de propuesta.`,
      keyFactors: [
        "Tiempo transcurrido desde el último contacto con el decisor",
        "Competidores en proceso de evaluación",
        "Probabilidad actual de cierre asignada",
      ],
      recommendation: "Agendar sesión de alineación con el decisor y enviar comparativa de retorno de inversión (ROI).",
    };
  }

  return {
    response: `Recomendación comercial para ${company}: Realizar seguimiento personalizado dentro de las próximas 24 horas.`,
  };
}
