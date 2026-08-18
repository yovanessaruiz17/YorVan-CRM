export type LeadStatus =
  | "nuevo"
  | "en_prospeccion"
  | "contactado"
  | "respondio"
  | "calificado"
  | "no_interesado"
  | "no_contactar"
  | "convertido"
  | "perdido";

export type LeadScoreLevel = "frio" | "tibio" | "caliente" | "muy_caliente";

export type PipelineStageId =
  | "prospecto"
  | "contactado"
  | "calificado"
  | "reunion_agendada"
  | "necesidad_identificada"
  | "propuesta_enviada"
  | "negociacion"
  | "cierre_ganado"
  | "cierre_perdido";

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  order: number;
  probability: number; // 0 to 100
  color: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  company: string;
  companyId?: string;
  jobTitle: string;
  city: string;
  country: string;
  website?: string;
  linkedin?: string;
  source: string; // 'LinkedIn', 'Web Organic', 'Google Ads', 'Cold Outreach', 'Referral', 'Events'
  campaign?: string;
  segment?: string;
  industry: string;
  companySize: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  assignedToUserId: string;
  assignedToName: string;
  status: LeadStatus;
  pipelineStage: PipelineStageId;
  score: number; // Calculated dynamic score
  scoreLevel: LeadScoreLevel;
  estimatedValue?: number; // COP or USD
  currency: string;
  createdAt: string;
  lastContactAt?: string;
  nextContactAt?: string;
  notes?: string;
  tags: string[];
  customFields?: Record<string, any>;
  hasBounced?: boolean;
  unsubscribed?: boolean;
}

export interface Company {
  id: string;
  name: string;
  taxId: string; // NIT / RUT / Tax identification
  industry: string;
  size: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  website: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  assignedToUserId: string;
  assignedToName: string;
  status: "prospecto" | "en_negociacion" | "cliente_activo" | "inactivo";
  potentialValue: number;
  currency: string;
  contactsCount: number;
  opportunitiesCount: number;
  createdAt: string;
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  decisionRole: "Decisor Principal" | "Influenciador" | "Usuario Clave" | "Comprador / Compras";
  linkedin?: string;
  assignedToUserId: string;
  assignedToName: string;
  createdAt: string;
  lastContactAt?: string;
  notes?: string;
  isPrimary?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  assignedToUserId: string;
  assignedToName: string;
  productService: string;
  value: number;
  currency: string;
  probability: number; // 0-100%
  weightedValue: number; // calculated: value * (probability / 100)
  stage: PipelineStageId;
  estimatedCloseDate: string;
  source: string;
  competitors?: string;
  lostReason?: string;
  lostNotes?: string;
  wonAt?: string;
  createdAt: string;
  lastActivityAt?: string;
  score: number;
  notes?: string;
}

export type ActivityType =
  | "email"
  | "llamada"
  | "whatsapp"
  | "reunion"
  | "nota"
  | "tarea"
  | "propuesta"
  | "cambio_etapa";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId: string;
  userName: string;
  leadId?: string;
  leadName?: string;
  companyId?: string;
  companyName?: string;
  opportunityId?: string;
  opportunityName?: string;
  contactId?: string;
  timestamp: string;
  metadata?: {
    callOutcome?: "contestada" | "no_contesta" | "buzon" | "reprogramada";
    durationMinutes?: number;
    meetingLocation?: "Google Meet" | "Zoom" | "Presencial" | "Teams";
    emailSubject?: string;
    emailStatus?: "enviado" | "abierto" | "clic" | "respondido" | "rebotado";
    oldStage?: string;
    newStage?: string;
    proposalAmount?: number;
  };
}

export type TaskPriority = "baja" | "media" | "alta" | "urgente";
export type TaskStatus = "pendiente" | "en_progreso" | "completada" | "cancelada";
export type TaskType = "llamada" | "email" | "reunion" | "seguimiento" | "propuesta" | "general";

export type { UserRole } from "./auth";

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedToUserId: string;
  assignedToName: string;
  createdByUserId: string;
  createdByName: string;
  dueDate: string; // ISO date
  dueTime?: string;
  priority: TaskPriority;
  status: TaskStatus;
  leadId?: string;
  leadName?: string;
  companyId?: string;
  companyName?: string;
  opportunityId?: string;
  opportunityName?: string;
  completedAt?: string;
  createdAt: string;
  type: TaskType;
}

export interface LeadScoreRule {
  id: string;
  action: string;
  points: number; // positive or negative
  category: "email" | "activity" | "meeting" | "data_quality" | "penalty";
  description: string;
  enabled: boolean;
}

export interface DynamicSegment {
  id: string;
  name: string;
  description: string;
  conditions: {
    field: string;
    operator: "equals" | "contains" | "greater_than" | "less_than" | "in" | "days_ago_greater";
    value: any;
  }[];
  criteria?: {
    field: string;
    operator: "equals" | "contains" | "greater_than" | "less_than" | "in" | "days_ago_greater";
    value: any;
  }[];
  leadsCount: number;
  createdAt: string;
}
