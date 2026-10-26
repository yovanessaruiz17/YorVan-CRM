import { Permission, UserRole } from "../types/auth";
import { PipelineStage, LeadScoreRule } from "../types/crm";
import { DeliverabilityConfig } from "../types/email";
import { CompanySettings, IntegrationConfig } from "../types/automations";

export const INITIAL_PERMISSIONS: Permission[] = [
  // Leads
  { id: "leads.view", name: "Ver Leads", category: "leads", description: "Ver lista y detalles de prospectos" },
  { id: "leads.create", name: "Crear Leads", category: "leads", description: "Crear nuevos prospectos manualmente" },
  { id: "leads.import", name: "Importar Leads", category: "leads", description: "Importar prospectos masivos vía CSV/Excel" },
  { id: "leads.edit", name: "Editar Leads", category: "leads", description: "Modificar información y scoring de prospectos" },
  { id: "leads.delete", name: "Eliminar Leads", category: "leads", description: "Eliminar prospectos permanentemente" },
  { id: "leads.assign", name: "Asignar Leads", category: "leads", description: "Transferir prospectos a otros vendedores" },
  
  // Contacts & Companies
  { id: "contacts.view", name: "Ver Contactos", category: "contacts", description: "Consultar directorio de contactos" },
  { id: "contacts.create", name: "Crear Contactos", category: "contacts", description: "Registrar nuevos contactos comerciales" },
  { id: "contacts.edit", name: "Editar Contactos", category: "contacts", description: "Modificar datos de contactos comerciales" },
  { id: "contacts.delete", name: "Eliminar Contactos", category: "contacts", description: "Eliminar contactos del directorio" },
  { id: "companies.view", name: "Ver Empresas", category: "companies", description: "Consultar directorio de cuentas/empresas" },
  { id: "companies.create", name: "Crear Empresas", category: "companies", description: "Registrar nuevas cuentas corporativas" },
  { id: "companies.edit", name: "Editar Empresas", category: "companies", description: "Modificar datos de cuentas/empresas" },
  { id: "companies.delete", name: "Eliminar Empresas", category: "companies", description: "Eliminar empresas y sus registros" },

  // Opportunities & Pipeline
  { id: "opportunities.view", name: "Ver Oportunidades", category: "opportunities", description: "Visualizar pipeline y negocios" },
  { id: "opportunities.create", name: "Crear Oportunidades", category: "opportunities", description: "Abrir nuevos negocios comerciales" },
  { id: "opportunities.edit", name: "Editar Oportunidades", category: "opportunities", description: "Mover etapas, cambiar montos y probabilidades" },
  { id: "opportunities.delete", name: "Eliminar Oportunidades", category: "opportunities", description: "Borrar negocios del pipeline" },
  { id: "opportunities.assign", name: "Reasignar Negocios", category: "opportunities", description: "Cambiar ejecutivo comercial asignado" },

  // Tasks
  { id: "tasks.view", name: "Ver Tareas", category: "tasks", description: "Consultar tareas propias y asignadas" },
  { id: "tasks.create", name: "Crear Tareas", category: "tasks", description: "Generar llamadas, reuniones y seguimientos" },
  { id: "tasks.edit", name: "Editar Tareas", category: "tasks", description: "Editar compromisos y cambiar estado" },
  { id: "tasks.delete", name: "Eliminar Tareas", category: "tasks", description: "Borrar tareas y compromisos" },
  { id: "tasks.assign", name: "Asignar Tareas", category: "tasks", description: "Delegar tareas a otros miembros del equipo" },

  // Campaigns & Email
  { id: "campaigns.view", name: "Ver Campañas", category: "campaigns", description: "Consultar campañas y métricas" },
  { id: "campaigns.create", name: "Crear Campañas", category: "campaigns", description: "Diseñar nuevas campañas y secuencias" },
  { id: "campaigns.send", name: "Lanzar Envíos", category: "campaigns", description: "Ejecutar envíos masivos y secuencias automáticas" },
  { id: "campaigns.delete", name: "Eliminar Campañas", category: "campaigns", description: "Borrar plantillas y campañas" },

  // Reports
  { id: "reports.view", name: "Ver Reportes", category: "reports", description: "Consultar analítica comercial, forecasts y cuotas" },

  // Users & Settings
  { id: "users.view", name: "Ver Usuarios", category: "users", description: "Ver lista del equipo comercial y metas" },
  { id: "users.create", name: "Crear Usuarios", category: "users", description: "Dar de alta nuevos usuarios en la plataforma" },
  { id: "users.edit", name: "Editar Usuarios", category: "users", description: "Modificar roles, metas y permisos" },
  { id: "users.delete", name: "Eliminar Usuarios", category: "users", description: "Desactivar o borrar usuarios del sistema" },
  { id: "settings.view", name: "Ver Configuración", category: "settings", description: "Ver ajustes generales del CRM y base de datos" },
  { id: "settings.edit", name: "Modificar Configuración", category: "settings", description: "Editar reglas, integraciones, DNS y credenciales" },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: INITIAL_PERMISSIONS.map((p) => p.id),
  gerente_comercial: [
    "leads.view", "leads.create", "leads.edit", "leads.assign", "leads.import",
    "contacts.view", "contacts.create", "contacts.edit",
    "companies.view", "companies.create", "companies.edit",
    "opportunities.view", "opportunities.create", "opportunities.edit", "opportunities.assign",
    "tasks.view", "tasks.create", "tasks.edit", "tasks.assign",
    "campaigns.view",
    "reports.view",
    "users.view", "users.edit",
    "settings.view",
  ],
  admin_comercial: [
    "leads.view", "leads.create", "leads.import", "leads.edit", "leads.delete", "leads.assign",
    "contacts.view", "contacts.create", "contacts.edit", "contacts.delete",
    "companies.view", "companies.create", "companies.edit", "companies.delete",
    "opportunities.view", "opportunities.create", "opportunities.edit", "opportunities.delete", "opportunities.assign",
    "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.assign",
    "campaigns.view", "campaigns.create", "campaigns.send",
    "reports.view",
    "users.view",
    "settings.view",
  ],
  vendedor: [
    "leads.view", "leads.create", "leads.edit",
    "contacts.view", "contacts.create", "contacts.edit",
    "companies.view", "companies.create", "companies.edit",
    "opportunities.view", "opportunities.create", "opportunities.edit",
    "tasks.view", "tasks.create", "tasks.edit",
    "reports.view",
  ],
  sdr: [
    "leads.view", "leads.create", "leads.import", "leads.edit", "leads.assign",
    "contacts.view", "contacts.create", "contacts.edit",
    "companies.view",
    "tasks.view", "tasks.create", "tasks.edit",
    "campaigns.view",
  ],
  marketing: [
    "leads.view", "leads.create", "leads.import",
    "contacts.view",
    "companies.view",
    "campaigns.view", "campaigns.create", "campaigns.send", "campaigns.delete",
    "reports.view",
  ],
  soporte: [
    "contacts.view", "contacts.create", "contacts.edit",
    "companies.view",
    "tasks.view", "tasks.create", "tasks.edit",
  ],
};

export interface RoleMeta {
  role: UserRole;
  title: string;
  badge: string;
  color: string;
  badgeClass: string;
  description: string;
  keyPermissions: string[];
  restrictedActions: string[];
}

export const ROLE_METADATA: Record<UserRole, RoleMeta> = {
  super_admin: {
    role: "super_admin",
    title: "Super Administrador",
    badge: "Super Admin",
    color: "rose",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    description: "Acceso total sin restricciones a toda la plataforma, usuarios, bases de datos y configuraciones.",
    keyPermissions: ["Control total", "Eliminación global", "Gestión de usuarios y roles", "Ajustes del sistema y Supabase", "Auditoría"],
    restrictedActions: [],
  },
  gerente_comercial: {
    role: "gerente_comercial",
    title: "Gerente Comercial",
    badge: "Gerente",
    color: "purple",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Supervisión directiva del pipeline global, cuotas del equipo, reasignación de prospectos y reportes ejecutivos.",
    keyPermissions: ["Pipeline global", "Reasignación de leads y negocios", "Gestión de cuotas comerciales", "Reportes & Analytics", "Ver equipo"],
    restrictedActions: ["No puede eliminar registros permanentemente", "No puede editar configuraciones críticas del sistema", "No puede borrar usuarios"],
  },
  admin_comercial: {
    role: "admin_comercial",
    title: "Administrador Comercial",
    badge: "Admin Comercial",
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Administración operativa de prospectos, clientes, oportunidades comerciales y campañas del equipo.",
    keyPermissions: ["Crear, editar y borrar registros", "Asignar leads y tareas", "Lanzar campañas masivas", "Gestión de pipeline", "Importar datos"],
    restrictedActions: ["No puede modificar cuotas del equipo", "No puede acceder a auditoría de seguridad del sistema"],
  },
  vendedor: {
    role: "vendedor",
    title: "Vendedor / Account Executive",
    badge: "Vendedor",
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Enfocado en prospección activa, avanzar oportunidades en el pipeline y cierre de negocios comerciales.",
    keyPermissions: ["Crear y editar prospectos", "Crear y avanzar oportunidades en pipeline", "Registrar contactos y empresas", "Crear tareas y llamadas"],
    restrictedActions: ["No puede eliminar prospectos ni oportunidades", "No puede reasignar leads a otros compañeros", "No tiene acceso a Configuración", "No puede gestionar usuarios ni auditoría"],
  },
  sdr: {
    role: "sdr",
    title: "SDR / Prospección Outbound",
    badge: "SDR",
    color: "amber",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Calificación outbound de prospectos, llamadas de descubrimiento y transferencia a vendedores.",
    keyPermissions: ["Crear e importar prospectos", "Calificación y scoring de leads", "Asignar prospectos calificados", "Agendar tareas y reuniones"],
    restrictedActions: ["No gestiona oportunidades en el pipeline", "No tiene acceso a reportes financieros de ventas", "No puede eliminar registros", "No tiene acceso a configuración"],
  },
  marketing: {
    role: "marketing",
    title: "Marketing & Automatización",
    badge: "Marketing",
    color: "indigo",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Diseño y despacho de campañas masivas por email, secuencias automatizadas, entregabilidad y segmentos.",
    keyPermissions: ["Crear y enviar campañas masivas", "Diseño de secuencias y plantillas", "Entregabilidad DNS y listas", "Segmentos dinámicos"],
    restrictedActions: ["No accede al pipeline de ventas", "No puede modificar oportunidades comerciales", "No puede gestionar usuarios ni cuotas"],
  },
  soporte: {
    role: "soporte",
    title: "Soporte & Éxito del Cliente",
    badge: "Soporte",
    color: "cyan",
    badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
    description: "Atención post-venta, registro de incidencias, directorio de empresas y contactos asignados.",
    keyPermissions: ["Ver y editar contactos y empresas", "Crear tareas y compromisos de soporte", "Registrar actividades y notas"],
    restrictedActions: ["Sin acceso a pipeline comercial", "Sin acceso a campañas masivas de marketing", "Sin acceso a analítica financiera", "Sin acceso a configuración"],
  },
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
