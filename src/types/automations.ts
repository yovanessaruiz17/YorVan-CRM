export type TriggerType =
  | "lead_created"
  | "lead_status_changed"
  | "lead_score_exceeded"
  | "email_replied"
  | "email_opened"
  | "meeting_scheduled"
  | "opportunity_stage_changed"
  | "opportunity_won"
  | "days_without_activity";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "contains" | "in";
  value: any;
}

export type ActionType =
  | "assign_user"
  | "create_task"
  | "change_status"
  | "change_stage"
  | "send_email_template"
  | "enroll_in_sequence"
  | "add_score"
  | "send_notification";

export interface AutomationAction {
  type: ActionType;
  params: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: TriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  timesExecuted: number;
  lastExecutedAt?: string;
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  logo?: string;
  taxId: string;
  country: string;
  timezone: string;
  currency: string;
  primaryLanguage: string;
  defaultPipelineId: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  provider: "whatsapp" | "gmail" | "outlook" | "google_calendar" | "meta_leads" | "zapier" | "make" | "webhooks";
  status: "connected" | "pending_config" | "disconnected";
  icon: string;
  description: string;
  webhookUrl?: string;
  lastSyncAt?: string;
  configFields: {
    key: string;
    label: string;
    value: string;
    isSecret: boolean;
    required: boolean;
  }[];
}
