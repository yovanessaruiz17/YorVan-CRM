import { DeliverabilityConfig, SuppressionEntry } from "../types/email";
import { Lead } from "../types/crm";

export function interpolateTemplateVariables(
  template: string,
  variables: {
    nombre?: string;
    apellido?: string;
    empresa?: string;
    cargo?: string;
    vendedor?: string;
    producto?: string;
    enlace?: string;
    industria?: string;
    ciudad?: string;
  }
): string {
  let result = template;
  result = result.replace(/\{\{nombre\}\}/g, variables.nombre || "Estimado/a");
  result = result.replace(/\{\{apellido\}\}/g, variables.apellido || "");
  result = result.replace(/\{\{empresa\}\}/g, variables.empresa || "su empresa");
  result = result.replace(/\{\{cargo\}\}/g, variables.cargo || "Líder");
  result = result.replace(/\{\{vendedor\}\}/g, variables.vendedor || "Equipo Comercial");
  result = result.replace(/\{\{producto\}\}/g, variables.producto || "YORVAR CRM");
  result = result.replace(/\{\{industria\}\}/g, variables.industria || "su sector");
  result = result.replace(/\{\{ciudad\}\}/g, variables.ciudad || "su ciudad");
  result = result.replace(/\{\{enlace\}\}/g, variables.enlace || "https://yorvar.co/demo");
  return result;
}

export function isEmailSuppressed(email: string, suppressionList: SuppressionEntry[]): { suppressed: boolean; reason?: string } {
  const normalized = email.trim().toLowerCase();
  const entry = suppressionList.find((item) => item.email.trim().toLowerCase() === normalized);
  if (entry) {
    return { suppressed: true, reason: entry.reason };
  }
  return { suppressed: false };
}

export function validateEmailSyntax(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function calculateCampaignBatches(
  totalRecipients: number,
  sendingSpeedPerHour: number,
  throttleDelaySeconds: number
) {
  const batchSize = Math.max(1, Math.min(25, Math.floor(sendingSpeedPerHour / 10)));
  const totalBatches = Math.ceil(totalRecipients / batchSize);
  const estimatedTotalMinutes = Math.ceil((totalRecipients / sendingSpeedPerHour) * 60);

  return {
    batchSize,
    totalBatches,
    estimatedTotalMinutes,
  };
}

export interface SpamAnalysisResult {
  spamScore: number;
  riskLevel: "bajo" | "medio" | "alto";
  spamWordsFound: string[];
  recommendations: string[];
}

const COMMON_SPAM_WORDS = [
  "gratis",
  "100% gratis",
  "urgente",
  "gana dinero",
  "millonario",
  "oferta exclusiva",
  "garantizado",
  "sin costo",
  "haz clic aqui",
  "haz clic aquí",
  "compre ahora",
  "descuento increible",
  "dinero facil",
  "ingresos extra",
  "actua ya",
  "actúa ya",
  "premio",
  "sorteo",
  "ganador",
  "viagra",
  "casino",
  "prestamo inmediato",
];

export function analyzeSpamScore(subject: string = "", body: string = ""): SpamAnalysisResult {
  const combined = `${subject} ${body}`.toLowerCase();
  const spamWordsFound: string[] = [];

  COMMON_SPAM_WORDS.forEach((word) => {
    if (combined.includes(word)) {
      spamWordsFound.push(word);
    }
  });

  let score = spamWordsFound.length * 15;

  // Check all caps in subject
  const uppercaseLetters = (subject.match(/[A-Z]/g) || []).length;
  if (subject.length > 5 && uppercaseLetters / subject.length > 0.4) {
    score += 20;
    spamWordsFound.push("Exceso de MAYÚSCULAS en el asunto");
  }

  // Check multiple exclamation or dollar signs
  if ((subject.match(/[!$?]{2,}/g) || []).length > 0) {
    score += 15;
    spamWordsFound.push("Signos de exclamación/dólar repetidos (!!! / $$$)");
  }

  // Check length
  if (body.trim().length < 50) {
    score += 10;
  }

  const normalizedScore = Math.min(100, Math.max(0, score));
  let riskLevel: "bajo" | "medio" | "alto" = "bajo";
  if (normalizedScore > 50) riskLevel = "alto";
  else if (normalizedScore > 20) riskLevel = "medio";

  const recommendations: string[] = [];
  if (spamWordsFound.length > 0) {
    recommendations.push("Reemplaza los términos promocionales de alto riesgo por lenguaje consultivo y enfocado en valor comercial.");
  }
  if (subject.length > 60) {
    recommendations.push("Mantén la línea de asunto en menos de 50 caracteres para optimizar la visualización en dispositivos móviles.");
  }
  if (!body.includes("{{nombre}}")) {
    recommendations.push("Utiliza etiquetas de personalización como {{nombre}} y {{empresa}} para mejorar la tasa de respuesta.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Tu plantilla cumple con las mejores prácticas de entregabilidad B2B y tiene alta probabilidad de llegar a la bandeja principal (Inbox).");
  }

  return {
    spamScore: normalizedScore,
    riskLevel,
    spamWordsFound,
    recommendations,
  };
}

export function simulateDnsCheck(config: DeliverabilityConfig): DeliverabilityConfig {
  const updatedRecords = config.dnsRecords.map((rec) => ({
    ...rec,
    status: "configured" as const,
  }));

  return {
    ...config,
    authStatus: "fully_authenticated",
    dnsRecords: updatedRecords,
    reputationScore: 99,
  };
}
