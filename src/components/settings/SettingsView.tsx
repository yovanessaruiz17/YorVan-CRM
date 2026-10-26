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
  Download,
  FileCode,
  UserPlus,
  Edit3,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../types/auth";
import { UserRole } from "../../types/crm";
import { RoleBadge } from "../common/Badge";
import { EmployeeModal } from "../team/EmployeeModal";
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

  const {
    currentUser,
    users = [],
    switchUser,
    updateUserRole,
    hasPermission,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"supabase" | "crm" | "scoring" | "team" | "roles">("supabase");
  const [currency, setCurrency] = useState(systemConfig?.currency || "COP");
  const [companyName, setCompanyName] = useState(systemConfig?.companyName || "YORVAR Corp");

  // Employee Modal state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<User | null>(null);
  const [employeeSuccessMsg, setEmployeeSuccessMsg] = useState<string | null>(null);

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

  const handleDownloadSQL = () => {
    const blob = new Blob([generateSupabaseSchemaSQL()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "supabase_schema.sql";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Script SQL para Inicializar Tablas en Supabase</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  También encuentras este archivo directamente en la raíz de tu proyecto como <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-emerald-700 font-bold">/supabase_schema.sql</code>. Ejecútalo en el <strong>SQL Editor</strong> de Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadSQL}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center gap-1.5 transition-all border border-emerald-200"
                  title="Descargar archivo supabase_schema.sql"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Descargar .sql</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySQL}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? "¡Copiado!" : "Copiar Script SQL"}</span>
                </button>
              </div>
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
          {employeeSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
              <span>{employeeSuccessMsg}</span>
              <button onClick={() => setEmployeeSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Gestión de Empleados & Credenciales</h3>
              <p className="text-xs text-slate-500">
                Usuarios con acceso a la plataforma, roles comerciales y permisos asignados por el Super Administrador
              </p>
            </div>

            <button
              onClick={() => {
                setEmployeeToEdit(null);
                setIsEmployeeModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Empleado</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Permisos</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isUserAdmin = u.role === "super_admin";
                  const permCount = u.customPermissions?.length ?? (isUserAdmin ? "Total" : "Rol");

                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {u.name} {u.lastName}
                              {u.id === currentUser.id && (
                                <span className="ml-1.5 text-[10px] text-indigo-600 font-bold">
                                  (Tú)
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400">{u.jobTitle}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>

                      <td className="py-3.5 px-4">
                        <RoleBadge role={u.role} />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {isUserAdmin ? "Acceso Total" : `${permCount} permisos`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.status === "active" ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Inactivo
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEmployeeToEdit(u);
                              setIsEmployeeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                            title="Editar usuario y permisos"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => switchUser(u.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition-colors"
                              title="Simular sesión con este rol"
                            >
                              Simular
                            </button>
                          )}

                          {!isUserAdmin && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar al empleado ${u.name} ${u.lastName}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Roles */}
      {activeTab === "roles" && (
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Matriz de Roles & Permisos (RBAC)</h3>
            <p className="text-slate-500">
              El Super Administrador define y asigna los permisos de cada colaborador. Al crear un empleado se precargan los permisos de su rol y pueden ajustarse individualmente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-rose-700 text-sm block">👑 Super Administrador</span>
              <p className="text-[11px] text-slate-500">
                Control absoluto irrestricto de toda la plataforma, bases de datos Supabase, auditoría y gestión de empleados.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>Gestión de Usuarios (Crear, Editar, Borrar)</li>
                <li>Control total de Leads, Negocios y Contactos</li>
                <li>Campañas masivas, secuencias y deliverability</li>
                <li>Configuración del sistema y sincronización Supabase</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-purple-700 text-sm block">📊 Gerente Comercial</span>
              <p className="text-[11px] text-slate-500">
                Supervisión del pipeline global, forecast de ingresos, reasignación de prospectos y metas de equipo.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>leads.view, leads.create, leads.assign</li>
                <li>opportunities.manage & reasignación</li>
                <li>analytics.view (Forecast global y metas)</li>
                <li>Supervisión del equipo comercial</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-indigo-700 text-sm block">🛠️ Administrador Comercial</span>
              <p className="text-[11px] text-slate-500">
                Operaciones diarias de base de datos comercial, importación masiva, depuración y soporte operativo.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>leads.import, leads.edit, leads.delete</li>
                <li>contacts & companies (Mantenimiento total)</li>
                <li>opportunities.edit & delete</li>
                <li>campañas masivas y plantillas</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-amber-700 text-sm block">💼 Vendedor / Ejecutivo (AE)</span>
              <p className="text-[11px] text-slate-500">
                Gestión directa de prospectos asignados, avance de oportunidades en pipeline, llamadas y tareas comerciales.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>leads.view (Propios) & leads.edit</li>
                <li>opportunities.view & update</li>
                <li>tasks.manage (Llamadas, reuniones)</li>
                <li>reports.view (Desempeño personal)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-cyan-700 text-sm block">🎯 SDR / Prospección Outbound</span>
              <p className="text-[11px] text-slate-500">
                Generación inicial de prospectos, importación de listas, scoring, cadencias frías y calificación antes del traspaso.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>leads.create, leads.import, leads.edit</li>
                <li>contacts.create</li>
                <li>tasks.manage (Primer contacto y calificación)</li>
                <li>campaigns.view</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-pink-700 text-sm block">📣 Marketing & Automatización</span>
              <p className="text-[11px] text-slate-500">
                Diseño y lanzamiento de campañas de email masivo, plantillas de correo, segmentación dinámica y análisis de aperturas.
              </p>
              <ul className="space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                <li>campaigns.* (Crear, Enviar, Eliminar)</li>
                <li>leads.import & segmentación dinámica</li>
                <li>reports.view (Métricas de campañas)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={(data, isEdit, id) => {
          if (isEdit && id) {
            updateUser(id, data);
            setEmployeeSuccessMsg(`Empleado "${data.name} ${data.lastName}" actualizado.`);
          } else {
            addUser(data);
            setEmployeeSuccessMsg(`Nuevo empleado "${data.name} ${data.lastName}" creado con éxito.`);
          }
          setTimeout(() => setEmployeeSuccessMsg(null), 4000);
        }}
        employeeToEdit={employeeToEdit}
        existingUsers={users}
      />
    </div>
  );
};
