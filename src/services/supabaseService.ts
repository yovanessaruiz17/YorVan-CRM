import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Lead,
  Company,
  Contact,
  Opportunity,
  Task,
  Activity,
} from "../types/crm";
import { AuditLog } from "../types/auth";
import { Campaign, Sequence, EmailTemplate } from "../types/email";
import { CompanySettings, AutomationRule } from "../types/automations";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  lastSyncTime?: string;
  isConnected?: boolean;
}

const SUPABASE_STORAGE_KEY = "yorvar_crm_supabase_config";

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading Supabase config from localStorage", e);
  }

  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || "",
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "",
    autoSync: false,
    isConnected: false,
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Error saving Supabase config", e);
  }
}

let cachedClient: SupabaseClient | null = null;
let currentConfigKey = "";

export function getSupabaseClient(overrideConfig?: Partial<SupabaseConfig>): SupabaseClient | null {
  const config = { ...getStoredSupabaseConfig(), ...overrideConfig };
  if (!config.url || !config.anonKey) {
    return null;
  }

  const key = `${config.url}::${config.anonKey}`;
  if (cachedClient && currentConfigKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentConfigKey = key;
    return cachedClient;
  } catch (e) {
    console.error("Failed to initialize Supabase client", e);
    return null;
  }
}

export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> {
  const cfg = config || getStoredSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    return {
      success: false,
      message: "Falta la URL de Supabase o la Anon API Key.",
    };
  }

  const startTime = Date.now();
  try {
    const client = getSupabaseClient(cfg);
    if (!client) {
      return { success: false, message: "No se pudo instanciar el cliente de Supabase." };
    }

    // Try a simple select or health query
    const { error } = await client.from("crm_leads").select("id").limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, it's still a valid connection to Supabase auth/REST
      if (error.code === "42P01" || error.message.includes("does not exist") || error.message.includes("relation")) {
        return {
          success: true,
          message: "Conexión a Supabase exitosa. (Nota: Las tablas personalizadas aún no han sido creadas en Supabase, ejecuta el script SQL provisto).",
          latencyMs: latency,
        };
      }
      if (error.code === "PGRST301" || error.message.includes("JWT") || error.message.includes("apikey")) {
        return {
          success: false,
          message: `Credenciales inválidas: ${error.message}`,
        };
      }
      return {
        success: true,
        message: `Conexión verificada (${error.message})`,
        latencyMs: latency,
      };
    }

    return {
      success: true,
      message: "Conexión con Supabase verificada y lista para sincronización.",
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Error inesperado al conectar con Supabase.",
    };
  }
}

export interface FullCRMData {
  leads: Lead[];
  companies: Company[];
  contacts: Contact[];
  opportunities: Opportunity[];
  tasks: Task[];
  activities: Activity[];
  campaigns: Campaign[];
  sequences: Sequence[];
  templates: EmailTemplate[];
  auditLogs: AuditLog[];
  companySettings: CompanySettings;
  automations: AutomationRule[];
}

export async function uploadAllToSupabase(data: FullCRMData): Promise<{
  success: boolean;
  syncedCounts: Record<string, number>;
  errors: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedCounts: {},
      errors: ["Supabase no está configurado."],
    };
  }

  const errors: string[] = [];
  const syncedCounts: Record<string, number> = {};

  // 1. Companies
  try {
    if (data.companies?.length) {
      const formatted = data.companies.map((c) => ({
        id: c.id,
        name: c.name,
        tax_id: c.taxId,
        industry: c.industry,
        size: c.size,
        website: c.website,
        city: c.city,
        country: c.country,
        address: c.address,
        phone: c.phone,
        assigned_to_user_id: c.assignedToUserId,
        assigned_to_name: c.assignedToName,
        status: c.status,
        potential_value: c.potentialValue,
        currency: c.currency,
        contacts_count: c.contactsCount,
        opportunities_count: c.opportunitiesCount,
        created_at: c.createdAt,
        notes: c.notes,
        raw_data: c,
      }));
      const { error } = await client.from("crm_companies").upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Empresas: ${error.message}`);
      else syncedCounts["Empresas"] = formatted.length;
    }
  } catch (e: any) {
    errors.push(`Empresas: ${e.message}`);
  }

  // 2. Contacts
  try {
    if (data.contacts?.length) {
      const formatted = data.contacts.map((c) => ({
        id: c.id,
        name: c.name,
        last_name: c.lastName,
        email: c.email,
        phone: c.phone,
        whatsapp: c.whatsapp,
        company_id: c.companyId,
        company_name: c.companyName,
        job_title: c.jobTitle,
        decision_role: c.decisionRole,
        linkedin: c.linkedin,
        assigned_to_user_id: c.assignedToUserId,
        assigned_to_name: c.assignedToName,
        is_primary: c.isPrimary,
        created_at: c.createdAt,
        raw_data: c,
      }));
      const { error } = await client.from("crm_contacts").upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Contactos: ${error.message}`);
      else syncedCounts["Contactos"] = formatted.length;
    }
  } catch (e: any) {
    errors.push(`Contactos: ${e.message}`);
  }

  // 3. Leads
  try {
    if (data.leads?.length) {
      const formatted = data.leads.map((l) => ({
        id: l.id,
        name: l.name,
        last_name: l.lastName,
        email: l.email,
        phone: l.phone,
        company: l.company,
        company_id: l.companyId,
        job_title: l.jobTitle,
        city: l.city,
        country: l.country,
        source: l.source,
        industry: l.industry,
        company_size: l.companySize,
        assigned_to_user_id: l.assignedToUserId,
        assigned_to_name: l.assignedToName,
        status: l.status,
        pipeline_stage: l.pipelineStage,
        score: l.score,
        score_level: l.scoreLevel,
        estimated_value: l.estimatedValue,
        currency: l.currency,
        created_at: l.createdAt,
        tags: l.tags,
        notes: l.notes,
        raw_data: l,
      }));
      const { error } = await client.from("crm_leads").upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Prospectos: ${error.message}`);
      else syncedCounts["Prospectos"] = formatted.length;
    }
  } catch (e: any) {
    errors.push(`Prospectos: ${e.message}`);
  }

  // 4. Opportunities
  try {
    if (data.opportunities?.length) {
      const formatted = data.opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        company_id: o.companyId,
        company_name: o.companyName,
        contact_id: o.contactId,
        contact_name: o.contactName,
        assigned_to_user_id: o.assignedToUserId,
        assigned_to_name: o.assignedToName,
        product_service: o.productService,
        value: o.value,
        currency: o.currency,
        probability: o.probability,
        weighted_value: o.weightedValue,
        stage: o.stage,
        estimated_close_date: o.estimatedCloseDate,
        source: o.source,
        score: o.score,
        created_at: o.createdAt,
        raw_data: o,
      }));
      const { error } = await client.from("crm_opportunities").upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Oportunidades: ${error.message}`);
      else syncedCounts["Oportunidades"] = formatted.length;
    }
  } catch (e: any) {
    errors.push(`Oportunidades: ${e.message}`);
  }

  // 5. Tasks
  try {
    if (data.tasks?.length) {
      const formatted = data.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        type: t.type,
        status: t.status,
        priority: t.priority,
        assigned_to_user_id: t.assignedToUserId,
        assigned_to_name: t.assignedToName,
        due_date: t.dueDate,
        due_time: t.dueTime,
        lead_id: t.leadId,
        opportunity_id: t.opportunityId,
        company_name: t.companyName,
        created_at: t.createdAt,
        raw_data: t,
      }));
      const { error } = await client.from("crm_tasks").upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Tareas: ${error.message}`);
      else syncedCounts["Tareas"] = formatted.length;
    }
  } catch (e: any) {
    errors.push(`Tareas: ${e.message}`);
  }

  // 6. Activities
  try {
    if (data.activities?.length) {
      const formatted = data.activities.slice(0, 100).map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        user_id: a.userId,
        user_name: a.userName,
        lead_id: a.leadId,
        lead_name: a.leadName,
        company_id: a.companyId,
        company_name: a.companyName,
        created_at: (a as any).createdAt || a.timestamp || new Date().toISOString(),
        raw_data: a,
      }));
      const { error } = await client.from("crm_activities").upsert(formatted, { onConflict: "id" });
      if (error) errors.push(`Actividades: ${error.message}`);
      else syncedCounts["Actividades"] = formatted.length;
    }
  } catch (e: any) {
    errors.push(`Actividades: ${e.message}`);
  }

  // 7. General Settings
  try {
    const { error } = await client.from("crm_settings").upsert(
      [
        {
          key: "company_settings",
          value: data.companySettings,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "key" }
    );
    if (!error) syncedCounts["Configuración"] = 1;
  } catch (e) {
    // Ignore optional settings table errors
  }

  // Update last sync time
  const updatedCfg = {
    ...getStoredSupabaseConfig(),
    lastSyncTime: new Date().toISOString(),
    isConnected: errors.length === 0,
  };
  saveStoredSupabaseConfig(updatedCfg);

  return {
    success: errors.length === 0,
    syncedCounts,
    errors,
  };
}

export async function fetchAllFromSupabase(): Promise<{
  success: boolean;
  data?: Partial<FullCRMData>;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: "Supabase no está conectado." };
  }

  try {
    const [leadsRes, compRes, contRes, oppRes, taskRes, actRes] = await Promise.all([
      client.from("crm_leads").select("*"),
      client.from("crm_companies").select("*"),
      client.from("crm_contacts").select("*"),
      client.from("crm_opportunities").select("*"),
      client.from("crm_tasks").select("*"),
      client.from("crm_activities").select("*"),
    ]);

    const result: Partial<FullCRMData> = {};

    if (leadsRes.data && leadsRes.data.length > 0) {
      result.leads = leadsRes.data.map((r: any) => r.raw_data || {
        id: r.id,
        name: r.name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        company: r.company,
        companyId: r.company_id,
        jobTitle: r.job_title,
        city: r.city,
        country: r.country,
        source: r.source,
        industry: r.industry,
        companySize: r.company_size,
        assignedToUserId: r.assigned_to_user_id,
        assignedToName: r.assigned_to_name,
        status: r.status,
        pipelineStage: r.pipeline_stage,
        score: r.score,
        scoreLevel: r.score_level,
        estimatedValue: r.estimated_value,
        currency: r.currency,
        createdAt: r.created_at,
        tags: r.tags || [],
        notes: r.notes,
      });
    }

    if (compRes.data && compRes.data.length > 0) {
      result.companies = compRes.data.map((r: any) => r.raw_data || {
        id: r.id,
        name: r.name,
        taxId: r.tax_id,
        industry: r.industry,
        size: r.size,
        website: r.website,
        city: r.city,
        country: r.country,
        address: r.address,
        phone: r.phone,
        assignedToUserId: r.assigned_to_user_id,
        assignedToName: r.assigned_to_name,
        status: r.status,
        potentialValue: r.potential_value,
        currency: r.currency,
        contactsCount: r.contacts_count,
        opportunitiesCount: r.opportunities_count,
        createdAt: r.created_at,
        notes: r.notes,
      });
    }

    if (contRes.data && contRes.data.length > 0) {
      result.contacts = contRes.data.map((r: any) => r.raw_data || {
        id: r.id,
        name: r.name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        companyId: r.company_id,
        companyName: r.company_name,
        jobTitle: r.job_title,
        decisionRole: r.decision_role,
        assignedToUserId: r.assigned_to_user_id,
        assignedToName: r.assigned_to_name,
        createdAt: r.created_at,
      });
    }

    if (oppRes.data && oppRes.data.length > 0) {
      result.opportunities = oppRes.data.map((r: any) => r.raw_data || {
        id: r.id,
        title: r.title,
        companyId: r.company_id,
        companyName: r.company_name,
        contactId: r.contact_id,
        contactName: r.contact_name,
        assignedToUserId: r.assigned_to_user_id,
        assignedToName: r.assigned_to_name,
        productService: r.product_service,
        value: r.value,
        currency: r.currency,
        probability: r.probability,
        weightedValue: r.weighted_value,
        stage: r.stage,
        estimatedCloseDate: r.estimated_close_date,
        source: r.source,
        score: r.score,
        createdAt: r.created_at,
      });
    }

    if (taskRes.data && taskRes.data.length > 0) {
      result.tasks = taskRes.data.map((r: any) => r.raw_data || {
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        status: r.status,
        priority: r.priority,
        assignedToUserId: r.assigned_to_user_id,
        assignedToName: r.assigned_to_name,
        dueDate: r.due_date,
        dueTime: r.due_time,
        createdAt: r.created_at,
      });
    }

    return {
      success: true,
      data: result,
      message: "Datos descargados exitosamente desde Supabase.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Error al descargar datos de Supabase.",
    };
  }
}

export function generateSupabaseSchemaSQL(): string {
  return `-- =========================================================
-- YORVAR CRM - SQL SCHEMA SETUP FOR SUPABASE POSTGRESQL
-- Copia y pega este script en tu Supabase SQL Editor y dale "Run"
-- =========================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Empresas (Companies)
CREATE TABLE IF NOT EXISTS public.crm_companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tax_id TEXT,
    industry TEXT,
    size TEXT,
    website TEXT,
    city TEXT,
    country TEXT DEFAULT 'Colombia',
    address TEXT,
    phone TEXT,
    assigned_to_user_id TEXT,
    assigned_to_name TEXT,
    status TEXT DEFAULT 'prospecto',
    potential_value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    contacts_count INTEGER DEFAULT 0,
    opportunities_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    raw_data JSONB
);

-- 3. Tabla de Contactos (Contacts)
CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    company_id TEXT,
    company_name TEXT,
    job_title TEXT,
    decision_role TEXT,
    linkedin TEXT,
    assigned_to_user_id TEXT,
    assigned_to_name TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 4. Tabla de Prospectos / Leads
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    company_id TEXT,
    job_title TEXT,
    city TEXT,
    country TEXT DEFAULT 'Colombia',
    source TEXT,
    industry TEXT,
    company_size TEXT,
    assigned_to_user_id TEXT,
    assigned_to_name TEXT,
    status TEXT DEFAULT 'nuevo',
    pipeline_stage TEXT DEFAULT 'prospecto',
    score INTEGER DEFAULT 20,
    score_level TEXT DEFAULT 'frio',
    estimated_value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 5. Tabla de Oportunidades / Pipeline
CREATE TABLE IF NOT EXISTS public.crm_opportunities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company_id TEXT,
    company_name TEXT,
    contact_id TEXT,
    contact_name TEXT,
    assigned_to_user_id TEXT,
    assigned_to_name TEXT,
    product_service TEXT,
    value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'COP',
    probability INTEGER DEFAULT 20,
    weighted_value NUMERIC DEFAULT 0,
    stage TEXT DEFAULT 'prospecto',
    estimated_close_date TEXT,
    source TEXT,
    score INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 6. Tabla de Tareas Comerciales
CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'llamada',
    status TEXT DEFAULT 'pendiente',
    priority TEXT DEFAULT 'media',
    assigned_to_user_id TEXT,
    assigned_to_name TEXT,
    due_date TEXT,
    due_time TEXT,
    lead_id TEXT,
    opportunity_id TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 7. Tabla de Actividades / Timeline
CREATE TABLE IF NOT EXISTS public.crm_activities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    user_id TEXT,
    user_name TEXT,
    lead_id TEXT,
    lead_name TEXT,
    company_id TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

-- 8. Tabla de Configuración y Metadatos
CREATE TABLE IF NOT EXISTS public.crm_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) Y POLÍTICAS PÚBLICAS
-- =========================================================
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para API pública con Anon Key
DROP POLICY IF EXISTS "Anon All Access crm_companies" ON public.crm_companies;
CREATE POLICY "Anon All Access crm_companies" ON public.crm_companies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access crm_contacts" ON public.crm_contacts;
CREATE POLICY "Anon All Access crm_contacts" ON public.crm_contacts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access crm_leads" ON public.crm_leads;
CREATE POLICY "Anon All Access crm_leads" ON public.crm_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access crm_opportunities" ON public.crm_opportunities;
CREATE POLICY "Anon All Access crm_opportunities" ON public.crm_opportunities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access crm_tasks" ON public.crm_tasks;
CREATE POLICY "Anon All Access crm_tasks" ON public.crm_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access crm_activities" ON public.crm_activities;
CREATE POLICY "Anon All Access crm_activities" ON public.crm_activities FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access crm_settings" ON public.crm_settings;
CREATE POLICY "Anon All Access crm_settings" ON public.crm_settings FOR ALL USING (true) WITH CHECK (true);
`;
}
