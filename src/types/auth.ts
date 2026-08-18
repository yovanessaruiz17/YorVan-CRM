export type UserRole =
  | "super_admin"
  | "admin_comercial"
  | "gerente_comercial"
  | "vendedor"
  | "sdr"
  | "marketing"
  | "soporte";

export interface Permission {
  id: string;
  name: string;
  category: "leads" | "contacts" | "companies" | "opportunities" | "tasks" | "campaigns" | "reports" | "users" | "settings";
  description: string;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  jobTitle: string;
  avatar: string;
  status: "active" | "inactive";
  customPermissions?: string[]; // Overrides or additions to role defaults
  phone?: string;
  dealsWonCount?: number;
  revenueGenerated?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: "lead" | "company" | "contact" | "opportunity" | "task" | "campaign" | "setting" | "sequence";
  entityId: string;
  entityName: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "task_due" | "new_lead" | "email_reply" | "deal_won" | "deal_lost" | "campaign_alert" | "system";
  isRead: boolean;
  link?: string;
  entityId?: string;
  createdAt: string;
}
