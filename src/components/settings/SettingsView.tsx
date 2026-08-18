import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Key,
  Globe,
  DollarSign,
  Building,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  Database,
  Cloud,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Server,
  Zap,
  Layers,
  ExternalLink,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/crm";
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  testSupabaseConnection,
  uploadAllToSupabase,
  fetchAllFromSupabase,
  generateSupabaseSchemaSQL,
  SupabaseConfig,
} from "../../services/supabaseService";

export const SettingsView: React.FC = () => {
  const {
    users = [],
    systemConfig,
    updateSystemConfig,
    leads = [],
    companies = [],
    contacts = [],
    opportunities = [],
    tasks = [],
    activities = [],
    campaigns = [],
    sequences = [],
    templates = [],
    auditLogs = [],
    companySettings,
    automations = [],
    setLeads,
    setCompanies,
    setContacts,
    setOpportunities,
    setTasks,
  } = useCRM();

  const { currentUser, switchUser, updateUserRole, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<"supabase" | "crm" | "scoring" | "team" | "roles">("supabase");
  const [currency, setCurrency] = useState(systemConfig?.currency || "COP");
  const [companyName, setCompanyName] = useState(systemConfig?.companyName || "YORVAR Corp");

  // Supabase State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    setSupabaseConfig(getStoredSupabaseConfig());
  }, []);

  const handleSaveCRM = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig({
      currency,
      companyName,
    });
    alert("Configuración de sistema actualizada.");
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseConfig);
    setTestResult(null);
    setSyncStatus("Configuración de Supabase guardada.");
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseConfig);
    setTestResult(res);
    setIsTestingConnection(false);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus("Subiendo datos locales a Supabase...");
    const res = await uploadAllToSupabase({
      leads,
      companies,
      contacts,
      opportunities,
      tasks,
      activities,
      campaigns,
      sequences,
      templates,
      auditLogs,
      companySettings,
      automations,
    });

    setIsSyncing(false);
    if (res.success) {
      setSyncStatus(`¡Sincronización completa! Se subieron ${Object.entries(res.syncedCounts).map(([k, v]) => `${v} ${k}`).join(", ")}.`);
    } else {
      setSyncStatus(`Errores durante la sincronización: ${res.errors.join("; ")}`);
    }
  };

  const handleFetchFromSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus("Descargando registros desde Supabase...");
    const res = await fetchAllFromSupabase();
    setIsSyncing(false);
    if (res.success && res.data) {
      if (res.data.leads && setLeads) setLeads(res.data.leads);
      if (res.data.companies && setCompanies) setCompanies(res.data.companies);
      if (res.data.contacts && setContacts) setContacts(res.data.contacts);
      if (res.data.opportunities && setOpportunities) setOpportunities(res.data.opportunities);
      if (res.data.tasks && setTasks) setTasks(res.data.tasks);
      setSyncStatus("¡Datos descargados y unificados en el CRM con éxito!");
    } else {
      setSyncStatus(`Error: ${res.message}`);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(generateSupabaseSchemaSQL());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Configuración del Sistema & Base de Datos
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Conexión con Supabase Cloud PostgreSQL, moneda, scoring y control de acceso.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("supabase")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "supabase"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Base de Datos Supabase</span>
        </button>

        <button
          onClick={() => setActiveTab("crm")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "crm"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Datos Organizacionales</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "team"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Usuarios & Accesos ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "roles"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Matriz de Roles (RBAC)</span>
        </button>
      </div>

      {/* Tab: Supabase Cloud Database */}
      {activeTab === "supabase" && (
        <div className="space-y-6">
          {syncStatus && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs font-semibold flex items-center justify-between">
              <span>{syncStatus}</span>
              <button onClick={() => setSyncStatus(null)} className="text-indigo-600 hover:text-indigo-900">✕</button>
            </div>
          )}

          {/* Supabase Connection Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    PostgreSQL Cloud Sync
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Conexión con Supabase</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresa la URL y API Key de tu proyecto en Supabase para sincronizar tus prospectos, empresas y pipeline.
                </p>
              </div>

              {testResult && (
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    testResult.success ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {testResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{testResult.success ? `Conectado (${testResult.latencyMs || 45}ms)` : "Fallo de conexión"}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL *
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Public API Key *
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all"
                >
                  Guardar Credenciales
                </button>

                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTestingConnection}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                >
                  {isTestingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                  <span>{isTestingConnection ? "Probando..." : "Probar Conexión"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                  <span>Subir Datos a Supabase</span>
                </button>

                <button
                  type="button"
                  onClick={handleFetchFromSupabase}
                  disabled={isSyncing}
                  className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Descargar de Supabase</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs ${testResult.success ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                  {testResult.message}
                </div>
              )}
            </form>
          </div>

          {/* SQL Generator Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Script SQL para Inicializar Tablas en Supabase</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ejecuta este código en el <strong>SQL Editor</strong> de tu panel de Supabase para crear las tablas con RLS.
                </p>
              </div>

              <button
                onClick={handleCopySQL}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? "¡Copiado!" : "Copiar Script SQL"}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
              <pre>{generateSupabaseSchemaSQL()}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: CRM Settings */}
      {activeTab === "crm" && (
        <form
          onSubmit={handleSaveCRM}
          className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4 max-w-xl text-xs"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900">Configuración Organizacional</h3>
            <p className="text-slate-500">Preferencias de moneda, empresa y formatos globales</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre de la Organización</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Moneda Principal</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              <option value="COP">COP ($ Pesos Colombianos)</option>
              <option value="USD">USD ($ Dólares Americanos)</option>
              <option value="MXN">MXN ($ Pesos Mexicanos)</option>
              <option value="EUR">EUR (€ Euros)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              Guardar Cambios
            </button>
          </div>

          {/* Software Ownership & License Card */}
          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Derechos Reservados y Propiedad del Software</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Esta plataforma y sus componentes son desarrollados y propiedad intelectual de <strong>Yordev</strong>.
                </p>
              </div>
              <a
                href="https://yordevctg17.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors shrink-0"
              >
                <span>Visitar Yordev</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Team */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Vendedores, directores y administradores con acceso a la plataforma
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Simular Sesión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 font-bold text-slate-700 text-xs flex items-center justify-center">
                          {u.name[0]}
                          {u.lastName?.[0]}
                        </div>
                        <span className="font-bold text-slate-900">
                          {u.name} {u.lastName}
                          {u.id === currentUser.id && (
                            <span className="ml-1.5 text-[10px] text-indigo-600 font-bold">
                              (Tú)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                        {u.role.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" /> Activo
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => switchUser(u.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                      >
                        Cambiar a este Usuario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Roles */}
      {activeTab === "roles" && (
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Matriz de Roles & Permisos (RBAC)</h3>
            <p className="text-slate-500">
              Permisos del sistema según el rol jerárquico en la organización
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-indigo-700 text-sm block">👑 Administrador</span>
              <p className="text-[11px] text-slate-500">
                Acceso total irrestricto a prospección, campañas, DNS, reportes, usuarios y configuraciones.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>leads.* (Crear, Editar, Eliminar)</li>
                <li>opportunities.* (Control total)</li>
                <li>campaigns.* & Sequences</li>
                <li>deliverability.* (Warmup & DNS)</li>
                <li>settings.manage</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-emerald-700 text-sm block">📊 Director Comercial</span>
              <p className="text-[11px] text-slate-500">
                Supervisión del pipeline, forecast comercial, aprobación de campañas y reasignación de leads.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>leads.view, leads.create, leads.edit</li>
                <li>opportunities.manage</li>
                <li>analytics.view (Forecast global)</li>
                <li>campaigns.create & templates</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-amber-700 text-sm block">💼 Vendedor / Ejecutivo</span>
              <p className="text-[11px] text-slate-500">
                Gestión directa de su cartera asignada de prospectos, llamadas, reuniones y cierre de negocios.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>leads.view (Propios) & edit</li>
                <li>opportunities.view & update</li>
                <li>tasks.manage</li>
                <li>templates.use</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
