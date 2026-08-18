export interface EmailTemplate {
  id: string;
  name: string;
  category:
    | "primer_contacto"
    | "seguimiento"
    | "reunion"
    | "propuesta"
    | "recordatorio"
    | "reenganche"
    | "cierre"
    | "postventa";
  subject: string;
  body: string; // supports {{nombre}}, {{apellido}}, {{empresa}}, {{cargo}}, {{vendedor}}, {{producto}}, {{enlace}}
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
  openRateAvg?: number;
  replyRateAvg?: number;
}

export interface EmailEvent {
  id: string;
  emailId: string;
  recipientEmail: string;
  campaignId?: string;
  sequenceId?: string;
  leadId?: string;
  eventType: "sent" | "delivered" | "opened" | "clicked" | "replied" | "bounced" | "unsubscribed" | "spam_complaint";
  timestamp: string;
  ip?: string;
  userAgent?: string;
  linkClicked?: string;
  bounceReason?: string;
}

export type SequenceStepType = "email" | "task_call" | "task_whatsapp" | "task_linkedin" | "llamada" | "whatsapp" | "linkedin";

export interface SequenceStep {
  id: string;
  dayOffset?: number; // e.g. Day 0, Day 2, Day 5, Day 9
  stepType?: SequenceStepType;
  templateId?: string;
  customSubject?: string;
  customBody?: string;
  taskTitle?: string;
  taskInstructions?: string;
  stepNumber?: number;
  type?: string;
  delayDays?: number;
  subject?: string;
  body?: string;
}

export interface Sequence {
  id: string;
  name: string;
  description: string;
  targetIndustry?: string;
  steps: SequenceStep[];
  isActive: boolean;
  enrolledLeadsCount: number;
  completedLeadsCount: number;
  repliedCount: number;
  meetingsBookedCount: number;
  exitConditions: {
    stopOnReply: boolean;
    stopOnMeetingBooked: boolean;
    stopOnUnsubscribe: boolean;
    stopOnBounce: boolean;
    stopOnOpportunityCreated: boolean;
  };
  createdAt: string;
}

export interface CampaignRecipient {
  leadId: string;
  name: string;
  email: string;
  company: string;
  status: "queued" | "sending" | "sent" | "delivered" | "opened" | "clicked" | "replied" | "bounced" | "failed" | "suppressed";
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorReason?: string;
}

export interface Campaign {
  id: string;
  name: string;
  segmentId?: string;
  segmentName?: string;
  templateId?: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  subject: string;
  body: string;
  status: "draft" | "scheduled" | "sending" | "completed" | "paused" | "failed";
  scheduleTime?: string;
  sendingSpeedPerHour: number; // e.g., 50, 100, 200 emails per hour
  throttleDelaySeconds: number; // delay between batches
  maxBounceThresholdPercent: number; // auto-pause if bounce rate exceeds (e.g., 5%)
  recipients: CampaignRecipient[];
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  createdAt: string;
  launchedAt?: string;
  completedAt?: string;
}

export interface DnsVerification {
  type: "SPF" | "DKIM" | "DMARC" | "MX";
  recordName: string;
  expectedValue: string;
  currentValue?: string;
  status: "configured" | "pending" | "error";
  description: string;
}

export interface DeliverabilityConfig {
  domain: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  provider: "SendGrid" | "Postmark" | "Amazon SES" | "Mailgun" | "Custom SMTP";
  smtpHost?: string;
  smtpPort?: number;
  authStatus: "fully_authenticated" | "partially_authenticated" | "unverified";
  dnsRecords: DnsVerification[];
  dailySendingLimit: number;
  hourlySendingLimit: number;
  currentDaySentCount: number;
  warmupMode: boolean;
  warmupDay: number;
  reputationScore: number; // 0 to 100
  bounceRateThreshold: number; // %
  complaintRateThreshold: number; // %
  autoPauseOnHighBounce: boolean;
}

export interface SuppressionEntry {
  id: string;
  email: string;
  reason: "unsubscribe" | "hard_bounce" | "spam_complaint" | "manual_request" | "invalid_syntax";
  source: string;
  addedAt: string;
  notes?: string;
}
