import { Permission, UserRole } from "../types/auth";
import { PipelineStage, LeadScoreRule } from "../types/crm";
import { DeliverabilityConfig } from "../types/email";
import { CompanySettings, IntegrationConfig } from "../types/automations";

export const INITIAL_PERMISSIONS: Permission[] = [
  // Leads
  { id: "leads.view", name: "Ver Leads", category: "leads", description: "Ver lista y detalles de prospectos" },
  { id: "leads.create", name: "Crear Leads", category: "leads", description: "Crear e importar nuevos prospectos" },
  { id: "leads.edit", name: "Editar Leads", category: "leads", description: "Modificar información de prospectos" },
  { id: "leads.delete", name: "Eliminar Leads", category: "leads", description: "Eliminar prospectos permanentemente" },
  { id: "leads.assign", name: "Asignar Leads", category: "leads", description: "Transferir prospectos a otros usuarios" },
  
  // Contacts & Companies
  { id: "contacts.view", name: "Ver Contactos", category: "contacts", description: "Consultar directorio de contactos" },
  { id: "contacts.edit", name: "Editar Contactos", category: "contacts", description: "Crear y editar contactos comerciales" },
  { id: "companies.view", name: "Ver Empresas", category: "companies", description: "Consultar directorio de cuentas/empresas" },
  { id: "companies.edit", name: "Editar Empresas", category: "companies", description: "Crear y modificar datos de empresas" },

  // Opportunities & Pipeline
  { id: "opportunities.view", name: "Ver Oportunidades", category: "opportunities", description: "Visualizar pipeline y negocios" },
  { id: "opportunities.create", name: "Crear Oportunidades", category: "opportunities", description: "Abrir nuevos negocios comerciales" },
  { id: "opportunities.edit", name: "Editar Oportunidades", category: "opportunities", description: "Mover etapas, cambiar montos" },
  { id: "opportunities.delete", name: "Eliminar Oportunidades", category: "opportunities", description: "Borrar negocios del pipeline" },
  { id: "opportunities.assign", name: "Reasignar Negocios", category: "opportunities", description: "Cambiar ejecutivo responsable" },

  // Tasks
  { id: "tasks.view", name: "Ver Tareas", category: "tasks", description: "Consultar tareas propias y asignadas" },
  { id: "tasks.create", name: "Crear Tareas", category: "tasks", description: "Generar llamadas, reuniones y seguimientos" },
  { id: "tasks.assign", name: "Asignar Tareas", category: "tasks", description: "Delegar tareas a miembros del equipo" },

  // Campaigns & Email
  { id: "campaigns.view", name: "Ver Campañas", category: "campaigns", description: "Consultar campañas y métricas" },
  { id: "campaigns.create", name: "Crear Campañas", category: "campaigns", description: "Diseñar nuevas campañas y secuencias" },
  { id: "campaigns.send", name: "Lanzar Envíos", category: "campaigns", description: "Ejecutar envíos masivos y secuencias" },
  { id: "campaigns.delete", name: "Eliminar Campañas", category: "campaigns", description: "Borrar plantillas y campañas" },

  // Reports
  { id: "reports.view", name: "Ver Reportes", category: "reports", description: "Consultar analítica comercial y forecasts" },

  // Users & Settings
  { id: "users.view", name: "Ver Usuarios", category: "users", description: "Ver lista del equipo comercial" },
  { id: "users.create", name: "Crear Usuarios", category: "users", description: "Dar de alta nuevos usuarios" },
  { id: "users.edit", name: "Editar Usuarios", category: "users", description: "Modificar roles y permisos" },
  { id: "users.delete", name: "Eliminar Usuarios", category: "users", description: "Desactivar o borrar usuarios" },
  { id: "settings.view", name: "Ver Configuración", category: "settings", description: "Ver ajustes generales del CRM" },
  { id: "settings.edit", name: "Modificar Configuración", category: "settings", description: "Editar reglas, integraciones y deliverability" },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: INITIAL_PERMISSIONS.map((p) => p.id),
  admin_comercial: [
    "leads.view", "leads.create", "leads.edit", "leads.assign",
    "contacts.view", "contacts.edit",
    "companies.view", "companies.edit",
    "opportunities.view", "opportunities.create", "opportunities.edit", "opportunities.assign",
    "tasks.view", "tasks.create", "tasks.assign",
    "campaigns.view", "campaigns.create", "campaigns.send",
    "reports.view",
    "users.view",
    "settings.view",
  ],
  gerente_comercial: [
    "leads.view", "leads.assign",
    "contacts.view",
    "companies.view",
    "opportunities.view", "opportunities.create", "opportunities.edit", "opportunities.assign",
    "tasks.view", "tasks.create", "tasks.assign",
    "reports.view",
    "users.view",
    "settings.view",
  ],
  vendedor: [
    "leads.view", "leads.create", "leads.edit",
    "contacts.view", "contacts.edit",
    "companies.view", "companies.edit",
    "opportunities.view", "opportunities.create", "opportunities.edit",
    "tasks.view", "tasks.create",
    "reports.view",
  ],
  sdr: [
    "leads.view", "leads.create", "leads.edit", "leads.assign",
    "contacts.view", "contacts.edit",
    "companies.view",
    "tasks.view", "tasks.create",
    "campaigns.view",
  ],
  marketing: [
    "leads.view",
    "contacts.view",
    "companies.view",
    "campaigns.view", "campaigns.create", "campaigns.send", "campaigns.delete",
    "reports.view",
  ],
  soporte: [
    "contacts.view", "contacts.edit",
    "companies.view", "companies.edit",
    "tasks.view", "tasks.create",
  ],
};

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  { id: "prospecto", name: "1. Prospecto", order: 1, probability: 10, color: "bg-slate-100 text-slate-700 border-slate-300" },
  { id: "contactado", name: "2. Contactado", order: 2, probability: 20, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "calificado", name: "3. Calificado", order: 3, probability: 35, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "reunion_agendada", name: "4. Reunión Agendada", order: 4, probability: 50, color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "necesidad_identificada", name: "5. Necesidad Detectada", order: 5, probability: 65, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "propuesta_enviada", name: "6. Propuesta Enviada", order: 75, probability: 75, color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "negociacion", name: "7. Negociación", order: 7, probability: 85, color: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "cierre_ganado", name: "8. Ganado", order: 8, probability: 100, color: "bg-emerald-50 text-emerald-700 border-emerald-200", isWon: true },
  { id: "cierre_perdido", name: "9. Perdido", order: 9, probability: 0, color: "bg-rose-50 text-rose-700 border-rose-200", isLost: true },
];

export const INITIAL_LEAD_SCORE_RULES: LeadScoreRule[] = [
  { id: "r1", action: "Apertura de Email", points: 10, category: "email", description: "El prospecto abre un email de prospección", enabled: true },
  { id: "r2", action: "Clic en Enlace del Email", points: 20, category: "email", description: "El prospecto hace clic en un enlace de propuesta o demo", enabled: true },
  { id: "r3", action: "Respuesta al Correo", points: 30, category: "email", description: "El prospecto responde activamente al vendedor o SDR", enabled: true },
  { id: "r4", action: "Agendamiento de Reunión", points: 40, category: "meeting", description: "Se confirma una llamada o reunión exploratoria", enabled: true },
  { id: "r5", action: "Solicitud de Propuesta Formal", points: 50, category: "activity", description: "El decisor solicita cotización formal o propuesta técnica", enabled: true },
  { id: "r6", action: "Completitud de Perfil B2B", points: 15, category: "data_quality", description: "NIT, Teléfono, LinkedIn y Empresa verificados", enabled: true },
  { id: "r7", action: "Rebote de Correo (Soft/Hard)", points: -25, category: "penalty", description: "El servidor de correo rechazó el mensaje", enabled: true },
  { id: "r8", action: "Email Inválido / Inexistente", points: -35, category: "penalty", description: "Sintaxis o dominio de correo no resoluble", enabled: true },
  { id: "r9", action: "Marcado como No Interesado", points: -40, category: "penalty", description: "El prospecto declaró explícitamente no requerir el servicio", enabled: true },
  { id: "r10", action: "Solicitud de Desuscripción", points: -60, category: "penalty", description: "El usuario se dio de baja mediante el preference center", enabled: true },
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  name: "YORVAR CRM Solutions",
  taxId: "901.452.889-1",
  country: "Colombia",
  timezone: "America/Bogota (GMT-5)",
  currency: "COP",
  primaryLanguage: "Español",
  defaultPipelineId: "b2b_sales_pipeline",
};

export const INITIAL_DELIVERABILITY_CONFIG: DeliverabilityConfig = {
  domain: "yorvar.co",
  senderName: "Equipo Comercial YORVAR",
  senderEmail: "ventas@yorvar.co",
  replyToEmail: "soporte@yorvar.co",
  provider: "SendGrid",
  authStatus: "fully_authenticated",
  dnsRecords: [
    {
      type: "SPF",
      recordName: "@ (yorvar.co)",
      expectedValue: "v=spf1 include:sendgrid.net ~all",
      currentValue: "v=spf1 include:sendgrid.net ~all",
      status: "configured",
      description: "Autoriza a la infraestructura de envío a despachar correos en nombre de yorvar.co",
    },
    {
      type: "DKIM",
      recordName: "s1._domainkey.yorvar.co",
      expectedValue: "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...",
      currentValue: "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...",
      status: "configured",
      description: "Firma criptográfica que garantiza la integridad y autenticidad del remitente",
    },
    {
      type: "DMARC",
      recordName: "_dmarc.yorvar.co",
      expectedValue: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yorvar.co; pct=100",
      currentValue: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yorvar.co; pct=100",
      status: "configured",
      description: "Política de alineación y reportes que protege tu reputación contra suplantación",
    },
    {
      type: "MX",
      recordName: "yorvar.co",
      expectedValue: "10 mail.yorvar.co",
      currentValue: "10 mail.yorvar.co",
      status: "configured",
      description: "Servidores de recepción de correo del dominio",
    },
  ],
  dailySendingLimit: 500,
  hourlySendingLimit: 75,
  currentDaySentCount: 142,
  warmupMode: true,
  warmupDay: 14,
  reputationScore: 98,
  bounceRateThreshold: 3.5,
  complaintRateThreshold: 0.1,
  autoPauseOnHighBounce: true,
};

export const formatCurrencyCOP = (amount: number, currency: string = "COP"): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const INITIAL_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    provider: "whatsapp",
    status: "pending_config",
    icon: "MessageSquare",
    description: "API oficial de Meta Cloud para envío de plantillas aprobadas y registro de chats comerciales.",
    configFields: [
      { key: "phone_number_id", label: "Phone Number ID (Meta)", value: "109847291823901", isSecret: false, required: true },
      { key: "waba_id", label: "WABA ID", value: "98234710928374", isSecret: false, required: true },
      { key: "permanent_token", label: "System User Token", value: "EAAJ...", isSecret: true, required: true },
    ],
  },
  {
    id: "gmail",
    name: "Google Workspace / Gmail",
    provider: "gmail",
    status: "connected",
    icon: "Mail",
    description: "Sincronización bidireccional de correos enviados, abiertos y respuestas en el timeline.",
    lastSyncAt: "Hace 10 minutos",
    configFields: [
      { key: "client_id", label: "Google OAuth Client ID", value: "apps.googleusercontent.com", isSecret: false, required: true },
      { key: "sync_inbox", label: "Sincronizar Bandeja de Entrada", value: "true", isSecret: false, required: true },
    ],
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    provider: "google_calendar",
    status: "connected",
    icon: "Calendar",
    description: "Agendamiento automático de reuniones comerciales, enlaces de Google Meet y recordatorios.",
    lastSyncAt: "Hace 5 minutos",
    configFields: [
      { key: "calendar_id", label: "Primary Calendar ID", value: "ventas@yorvar.co", isSecret: false, required: true },
    ],
  },
  {
    id: "webhooks",
    name: "Webhooks & API Gateway",
    provider: "webhooks",
    status: "connected",
    icon: "Webhook",
    description: "Recepción de leads en tiempo real desde formularios web, Landing Pages, Zapier, Make o n8n.",
    webhookUrl: "https://yorvar-crm-api.internal/api/webhooks/leads",
    configFields: [
      { key: "webhook_secret", label: "Webhook Signing Secret", value: "whsec_98a7sd8f97a8sd7f98a", isSecret: true, required: true },
    ],
  },
  {
    id: "meta_leads",
    name: "Meta Lead Ads (Facebook & Instagram)",
    provider: "meta_leads",
    status: "pending_config",
    icon: "Share2",
    description: "Ingesta directa de prospectos generados en campañas de anuncios de generación de clientes potenciales.",
    configFields: [
      { key: "page_access_token", label: "Page Access Token", value: "", isSecret: true, required: true },
      { key: "form_id", label: "Lead Gen Form ID", value: "", isSecret: false, required: true },
    ],
  },
];
