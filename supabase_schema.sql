-- ==============================================================================
-- 🚀 YORVAR CRM - SCRIPT SQL COMPLETO & POLÍTICAS RLS MULTI-TENANT (SUPABASE)
-- ==============================================================================
-- Arquitectura de Seguridad:
-- 1. Aislamiento Multi-Tenant estricto por organization_id (Sin default hardcodeado)
-- 2. Integración con Supabase Auth (auth.users) a través de public.user_profiles
-- 3. Eliminación total de políticas permisivas abiertas para rol anon
-- 4. Funciones Security Definer con SET search_path para evitar recursión RLS
-- 5. Disparadores de integridad: Inmutabilidad de Tenant, Inserción Forzada de Org,
--    y Validación de Referencias Cruzadas (Cross-Tenant FK Isolation)
-- 6. Diagnóstico de Integridad para datos heredados antes de asignación
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLA: PERFILES DE USUARIO RBAC (public.user_profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'vendedor',
    job_title TEXT,
    organization_id TEXT NOT NULL,
    avatar TEXT,
    custom_permissions TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLA: EMPRESAS / CUENTAS (public.crm_companies)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_companies (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
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

ALTER TABLE public.crm_companies ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- ==============================================================================
-- 4. TABLA: CONTACTOS / DECISORES (public.crm_contacts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
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

ALTER TABLE public.crm_contacts ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- ==============================================================================
-- 5. TABLA: PROSPECTOS / LEADS COMERCIALES (public.crm_leads)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
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

ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- ==============================================================================
-- 6. TABLA: OPORTUNIDADES / PIPELINE DE VENTAS (public.crm_opportunities)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_opportunities (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
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

ALTER TABLE public.crm_opportunities ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- ==============================================================================
-- 7. TABLA: TAREAS COMERCIALES (public.crm_tasks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
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

ALTER TABLE public.crm_tasks ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- ==============================================================================
-- 8. TABLA: HISTORIAL DE ACTIVIDADES (public.crm_activities)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_activities (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
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

ALTER TABLE public.crm_activities ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- ==============================================================================
-- 9. TABLA: CONFIGURACIÓN GLOBAL (public.crm_settings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_settings (
    key TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_settings ADD COLUMN IF NOT EXISTS organization_id TEXT;

-- ==============================================================================
-- 10. ÍNDICES DE RENDIMIENTO Y MULTI-TENANCY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_crm_leads_org ON public.crm_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned ON public.crm_leads(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON public.crm_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_crm_companies_org ON public.crm_companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_org ON public.crm_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_org ON public.crm_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_org ON public.crm_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_org ON public.crm_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON public.user_profiles(organization_id);

-- ==============================================================================
-- 11. FUNCIONES AUXILIARES SECURITY DEFINER (ANTI-RECURSIÓN Y SEARCH_PATH HARDENED)
-- ==============================================================================

-- Obtiene el organization_id del usuario autenticado actual sin disparar recursión RLS
CREATE OR REPLACE FUNCTION public.get_auth_user_organization_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Alias retrocompatible
CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.get_auth_user_organization_id();
$$;

-- Determina si el usuario autenticado tiene rol de Super Administrador
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND status = 'active'
  );
$$;

-- Permisos sobre funciones auxiliares
REVOKE ALL ON FUNCTION public.get_auth_user_organization_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_user_organization_id() TO authenticated;

REVOKE ALL ON FUNCTION public.current_user_organization_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_organization_id() TO authenticated;

REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- ==============================================================================
-- 12. PROTECCIÓN CONTRA ESCALACIÓN DE PRIVILEGIOS EN PERFILES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.protect_user_profile_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Si el usuario no es Super Administrador, impedir que altere su propio rol, organización, permisos o estado
  IF NOT public.is_super_admin() THEN
    IF NEW.role <> OLD.role THEN
      RAISE EXCEPTION 'Acceso denegado: No tiene permisos para modificar su propio rol.';
    END IF;
    IF NEW.organization_id <> OLD.organization_id THEN
      RAISE EXCEPTION 'Acceso denegado: No tiene permisos para modificar su organización.';
    END IF;
    IF NEW.custom_permissions IS DISTINCT FROM OLD.custom_permissions THEN
      RAISE EXCEPTION 'Acceso denegado: No tiene permisos para modificar permisos personalizados.';
    END IF;
    IF NEW.status <> OLD.status THEN
      RAISE EXCEPTION 'Acceso denegado: No tiene permisos para alterar el estado de su cuenta.';
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_profile_escalation ON public.user_profiles;
CREATE TRIGGER trg_protect_user_profile_escalation
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_profile_escalation();

-- ==============================================================================
-- 13. REVOCACIÓN TOTAL DE PRIVILEGIOS A ANON Y CONCESIÓN A AUTHENTICATED
-- ==============================================================================
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ==============================================================================
-- 14. DISPARADORES DE PROTECCIÓN DE INTEGRIDAD Y AISLAMIENTO MULTI-TENANT
-- ==============================================================================

-- A. Inserción Forzada de Organización (Garantiza que un usuario no cree registros en otro tenant)
CREATE OR REPLACE FUNCTION public.enforce_crm_tenant_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  auth_org TEXT;
BEGIN
  auth_org := public.get_auth_user_organization_id();

  IF NOT public.is_super_admin() THEN
    IF auth_org IS NULL OR auth_org = '' THEN
      RAISE EXCEPTION 'Violación de seguridad: El usuario autenticado no posee una organización asignada en su perfil.';
    END IF;
    -- Sobrescribe cualquier organization_id manipulado enviado por el cliente
    NEW.organization_id := auth_org;
  ELSE
    IF NEW.organization_id IS NULL OR NEW.organization_id = '' THEN
      IF auth_org IS NOT NULL AND auth_org <> '' THEN
        NEW.organization_id := auth_org;
      ELSE
        RAISE EXCEPTION 'Violación de seguridad: Debe especificar un organization_id para este registro.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_tenant_companies ON public.crm_companies;
CREATE TRIGGER trg_enforce_tenant_companies
  BEFORE INSERT ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_tenant_on_insert();

DROP TRIGGER IF EXISTS trg_enforce_tenant_contacts ON public.crm_contacts;
CREATE TRIGGER trg_enforce_tenant_contacts
  BEFORE INSERT ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_tenant_on_insert();

DROP TRIGGER IF EXISTS trg_enforce_tenant_leads ON public.crm_leads;
CREATE TRIGGER trg_enforce_tenant_leads
  BEFORE INSERT ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_tenant_on_insert();

DROP TRIGGER IF EXISTS trg_enforce_tenant_opportunities ON public.crm_opportunities;
CREATE TRIGGER trg_enforce_tenant_opportunities
  BEFORE INSERT ON public.crm_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_tenant_on_insert();

DROP TRIGGER IF EXISTS trg_enforce_tenant_tasks ON public.crm_tasks;
CREATE TRIGGER trg_enforce_tenant_tasks
  BEFORE INSERT ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_tenant_on_insert();

DROP TRIGGER IF EXISTS trg_enforce_tenant_activities ON public.crm_activities;
CREATE TRIGGER trg_enforce_tenant_activities
  BEFORE INSERT ON public.crm_activities
  FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_tenant_on_insert();

DROP TRIGGER IF EXISTS trg_enforce_tenant_settings ON public.crm_settings;
CREATE TRIGGER trg_enforce_tenant_settings
  BEFORE INSERT ON public.crm_settings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_crm_tenant_on_insert();

-- B. Inmutabilidad de Organización (Previene contrabando / Tenant Smuggling en actualizaciones)
CREATE OR REPLACE FUNCTION public.prevent_crm_tenant_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Violación de seguridad multi-tenant: No está permitido transferir registros entre organizaciones.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_tenant_mutation_companies ON public.crm_companies;
CREATE TRIGGER trg_prevent_tenant_mutation_companies
  BEFORE UPDATE ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.prevent_crm_tenant_mutation();

DROP TRIGGER IF EXISTS trg_prevent_tenant_mutation_contacts ON public.crm_contacts;
CREATE TRIGGER trg_prevent_tenant_mutation_contacts
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.prevent_crm_tenant_mutation();

DROP TRIGGER IF EXISTS trg_prevent_tenant_mutation_leads ON public.crm_leads;
CREATE TRIGGER trg_prevent_tenant_mutation_leads
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.prevent_crm_tenant_mutation();

DROP TRIGGER IF EXISTS trg_prevent_tenant_mutation_opportunities ON public.crm_opportunities;
CREATE TRIGGER trg_prevent_tenant_mutation_opportunities
  BEFORE UPDATE ON public.crm_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.prevent_crm_tenant_mutation();

DROP TRIGGER IF EXISTS trg_prevent_tenant_mutation_tasks ON public.crm_tasks;
CREATE TRIGGER trg_prevent_tenant_mutation_tasks
  BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.prevent_crm_tenant_mutation();

DROP TRIGGER IF EXISTS trg_prevent_tenant_mutation_activities ON public.crm_activities;
CREATE TRIGGER trg_prevent_tenant_mutation_activities
  BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW EXECUTE FUNCTION public.prevent_crm_tenant_mutation();

DROP TRIGGER IF EXISTS trg_prevent_tenant_mutation_settings ON public.crm_settings;
CREATE TRIGGER trg_prevent_tenant_mutation_settings
  BEFORE UPDATE ON public.crm_settings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_crm_tenant_mutation();

-- C. Validación de Integridad Cruzada Multi-Tenant (Previene relacionar empresas de otras organizaciones)
CREATE OR REPLACE FUNCTION public.validate_cross_tenant_references()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.company_id IS NOT NULL AND NEW.company_id <> '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.crm_companies c
      WHERE c.id = NEW.company_id AND c.organization_id = NEW.organization_id
    ) THEN
      RAISE EXCEPTION 'Violación de aislamiento multi-tenant: La empresa referenciada no pertenece a la misma organización.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_tenant_ref_contacts ON public.crm_contacts;
CREATE TRIGGER trg_validate_tenant_ref_contacts
  BEFORE INSERT OR UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.validate_cross_tenant_references();

DROP TRIGGER IF EXISTS trg_validate_tenant_ref_leads ON public.crm_leads;
CREATE TRIGGER trg_validate_tenant_ref_leads
  BEFORE INSERT OR UPDATE ON public.crm_leads
  FOR EACH ROW EXECUTE FUNCTION public.validate_cross_tenant_references();

DROP TRIGGER IF EXISTS trg_validate_tenant_ref_opps ON public.crm_opportunities;
CREATE TRIGGER trg_validate_tenant_ref_opps
  BEFORE INSERT OR UPDATE ON public.crm_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.validate_cross_tenant_references();

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) - POLÍTICAS ESTRICTAS POR TABLA
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

-- ELIMINAR CUALQUIER POLÍTICA INSEGURA PREVIA
DROP POLICY IF EXISTS "Anon All Access crm_companies" ON public.crm_companies;
DROP POLICY IF EXISTS "Anon All Access crm_contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Anon All Access crm_leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Anon All Access crm_opportunities" ON public.crm_opportunities;
DROP POLICY IF EXISTS "Anon All Access crm_tasks" ON public.crm_tasks;
DROP POLICY IF EXISTS "Anon All Access crm_activities" ON public.crm_activities;
DROP POLICY IF EXISTS "Anon All Access crm_settings" ON public.crm_settings;

-- POLÍTICAS: user_profiles (Antirrecurrencia garantizada por SECURITY DEFINER)
DROP POLICY IF EXISTS "Users can read profiles in same org" ON public.user_profiles;
DROP POLICY IF EXISTS "User can read own profile" ON public.user_profiles;
CREATE POLICY "User can read own profile" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Teammates can read org profiles" ON public.user_profiles;
CREATE POLICY "Teammates can read org profiles" ON public.user_profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid()
      OR organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage all profiles in org" ON public.user_profiles;
CREATE POLICY "Super admins can manage all profiles in org" ON public.user_profiles
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- POLÍTICAS MULTI-TENANT: crm_companies
DROP POLICY IF EXISTS "Org isolation crm_companies" ON public.crm_companies;
CREATE POLICY "Org isolation crm_companies" ON public.crm_companies
    FOR ALL TO authenticated
    USING (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    )
    WITH CHECK (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

-- POLÍTICAS MULTI-TENANT: crm_contacts
DROP POLICY IF EXISTS "Org isolation crm_contacts" ON public.crm_contacts;
CREATE POLICY "Org isolation crm_contacts" ON public.crm_contacts
    FOR ALL TO authenticated
    USING (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    )
    WITH CHECK (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

-- POLÍTICAS MULTI-TENANT: crm_leads
DROP POLICY IF EXISTS "Org isolation crm_leads" ON public.crm_leads;
CREATE POLICY "Org isolation crm_leads" ON public.crm_leads
    FOR ALL TO authenticated
    USING (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    )
    WITH CHECK (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

-- POLÍTICAS MULTI-TENANT: crm_opportunities
DROP POLICY IF EXISTS "Org isolation crm_opportunities" ON public.crm_opportunities;
CREATE POLICY "Org isolation crm_opportunities" ON public.crm_opportunities
    FOR ALL TO authenticated
    USING (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    )
    WITH CHECK (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

-- POLÍTICAS MULTI-TENANT: crm_tasks
DROP POLICY IF EXISTS "Org isolation crm_tasks" ON public.crm_tasks;
CREATE POLICY "Org isolation crm_tasks" ON public.crm_tasks
    FOR ALL TO authenticated
    USING (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    )
    WITH CHECK (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

-- POLÍTICAS MULTI-TENANT: crm_activities
DROP POLICY IF EXISTS "Org isolation crm_activities" ON public.crm_activities;
CREATE POLICY "Org isolation crm_activities" ON public.crm_activities
    FOR ALL TO authenticated
    USING (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    )
    WITH CHECK (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

-- POLÍTICAS MULTI-TENANT: crm_settings
DROP POLICY IF EXISTS "Org isolation crm_settings" ON public.crm_settings;
CREATE POLICY "Org isolation crm_settings" ON public.crm_settings
    FOR ALL TO authenticated
    USING (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    )
    WITH CHECK (
      organization_id = public.get_auth_user_organization_id()
      OR public.is_super_admin()
    );

-- ==============================================================================
-- 16. CONSULTAS DE DIAGNÓSTICO DE INTEGRIDAD PARA DATOS EXISTENTES
-- ==============================================================================
-- NO ejecute backfills ciegos. Ejecute estas consultas para identificar inconsistencias:
--
-- 1. Registros sin organización (Huérfanos):
-- SELECT 'crm_companies' AS tabla, count(*) AS sin_org FROM public.crm_companies WHERE organization_id IS NULL OR organization_id = ''
-- UNION ALL
-- SELECT 'crm_contacts', count(*) FROM public.crm_contacts WHERE organization_id IS NULL OR organization_id = ''
-- UNION ALL
-- SELECT 'crm_leads', count(*) FROM public.crm_leads WHERE organization_id IS NULL OR organization_id = ''
-- UNION ALL
-- SELECT 'crm_opportunities', count(*) FROM public.crm_opportunities WHERE organization_id IS NULL OR organization_id = ''
-- UNION ALL
-- SELECT 'crm_tasks', count(*) FROM public.crm_tasks WHERE organization_id IS NULL OR organization_id = ''
-- UNION ALL
-- SELECT 'crm_activities', count(*) FROM public.crm_activities WHERE organization_id IS NULL OR organization_id = '';
--
-- 2. Referencias cruzadas inconsistentes entre empresas y contactos/oportunidades:
-- SELECT 'contacto_empresa_inconsistente' AS tipo, c.id, c.name, c.organization_id AS org_contacto, cmp.organization_id AS org_empresa
-- FROM public.crm_contacts c
-- JOIN public.crm_companies cmp ON c.company_id = cmp.id
-- WHERE c.organization_id <> cmp.organization_id;
-- ==============================================================================
