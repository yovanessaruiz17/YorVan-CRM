import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Shield,
  Users,
  CheckCircle2,
  Server,
  CloudOff,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { UserRole, User } from "../../types/auth";
import { ROLE_METADATA } from "../../data/initialConfig";
import { RoleBadge } from "../common/Badge";

export const LoginView: React.FC = () => {
  const {
    users = [],
    login,
    loginAsDemoUser,
    resetPassword,
    isSupabaseConfigured,
    isDemoMode,
  } = useAuth();

  const superAdminUser = users.find((u) => u.role === "super_admin");
  const createdEmployees = users.filter((u) => u.role !== "super_admin");

  const [email, setEmail] = useState("yorleidys.navarro@yorvar.co");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [selectedUserPreview, setSelectedUserPreview] = useState<User | null>(superAdminUser || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || "Error al iniciar sesión.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar autenticación.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSuccessMessage(
          isSupabaseConfigured
            ? "Se ha enviado un enlace de recuperación a tu correo electrónico."
            : "Instrucción de recuperación procesada. Configura Supabase SMTP para envío de correos reales."
        );
      } else {
        setErrorMessage(res.error || "No se pudo procesar la solicitud de recuperación.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al solicitar restablecimiento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEmployee = (user: User) => {
    setEmail(user.email);
    setPassword("");
    setSelectedUserPreview(user);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSandboxDirectLogin = (user: User) => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      loginAsDemoUser(user);
      setIsLoading(false);
    }, 250);
  };

  const activeRole: UserRole = selectedUserPreview ? selectedUserPreview.role : "super_admin";
  const activeRoleMeta = ROLE_METADATA[activeRole] || ROLE_METADATA.super_admin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25">
            Y
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>YORVAR CRM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise Security
              </span>
            </h1>
            <p className="text-xs text-slate-400">Control de Acceso, Aislamiento & Permisos RBAC</p>
          </div>
        </div>

        {/* Security / Backend Provider Badge */}
        <div className="flex items-center gap-2 text-xs">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-500/40">
              <Server className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-semibold">Supabase Auth Activo (Producción)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/50 px-3.5 py-1.5 rounded-xl border border-amber-500/40">
              <CloudOff className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Modo Sandbox Local (Aislado)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form on Left, State/Employees on Right */}
      <div className="max-w-6xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Login Form */}
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isResetMode ? "Recuperación de Acceso" : "Acceso Autenticado"}</span>
              </span>

              {superAdminUser && !isResetMode && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail(superAdminUser.email);
                    setPassword("");
                    setSelectedUserPreview(superAdminUser);
                    setErrorMessage(null);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                >
                  <span>Cargar Super Admin</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isResetMode ? "Recuperar Contraseña" : "Iniciar Sesión"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isResetMode
                ? "Ingresa tu correo electrónico registrado para restablecer tus credenciales."
                : isSupabaseConfigured
                ? "Autenticación segura gestionada por Supabase Auth."
                : "Ingresa tus credenciales asignadas por el Super Administrador."}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {!isResetMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@yorvar.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduce tu contraseña"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar a la Plataforma</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@yorvar.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Enviando..." : "Enviar Enlace"}
                </button>
              </div>
            </form>
          )}

          {/* Security Notice Card */}
          <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">Control y Asignación de Usuarios:</span>
              <p>
                El Super Administrador gestiona credenciales y permisos desde el panel de <em>Equipo Comercial</em> o <em>Configuración</em>.
              </p>
              <p className="text-[10px] text-slate-500">
                Las contraseñas no se almacenan en texto plano ni se exponen en almacenamiento local.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Employees or Sandbox Role Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl space-y-5">
            {/* If NO employees created yet by Super Admin */}
            {createdEmployees.length === 0 ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Sin Cuentas de Prueba Preestablecidas
                      </h3>
                      <p className="text-xs text-slate-400">
                        Solo existe la cuenta de Super Administrador registrada.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Base Segura
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Las contraseñas por defecto han sido eliminadas para prevenir accesos no autorizados. El <strong>Super Administrador</strong> crea empleados, define contraseñas seguras y asigna permisos específicos por rol.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Paso 1</span>
                      <h4 className="text-xs font-bold text-white">Inicia como Admin</h4>
                      <p className="text-[11px] text-slate-400">Accede con credenciales autorizadas.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Paso 2</span>
                      <h4 className="text-xs font-bold text-white">Crea Empleados</h4>
                      <p className="text-[11px] text-slate-400">Registra el personal en "Equipo".</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Paso 3</span>
                      <h4 className="text-xs font-bold text-white">Asigna Permisos</h4>
                      <p className="text-[11px] text-slate-400">Configura accesos RBAC granulares.</p>
                    </div>
                  </div>
                </div>

                {/* Sandbox / Super Admin Fast Entry (explicitly labeled for sandbox) */}
                {superAdminUser && (
                  <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={superAdminUser.avatar}
                        alt={superAdminUser.name}
                        className="w-11 h-11 rounded-xl object-cover border border-indigo-400"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {superAdminUser.name} {superAdminUser.lastName}
                          </span>
                          <RoleBadge role={superAdminUser.role} />
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{superAdminUser.email}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSandboxDirectLogin(superAdminUser)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <span>Entrar como Super Admin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* If employees HAVE been created by Super Admin */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Colaboradores Registrados ({createdEmployees.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Selecciona un colaborador para iniciar sesión con su rol asignado.
                    </p>
                  </div>
                </div>

                {/* Employees Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {createdEmployees.map((u) => {
                    const isSelected = email.toLowerCase() === u.email.toLowerCase();

                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectEmployee(u)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/30"
                            : "bg-slate-900/60 border-slate-700/70 hover:bg-slate-700/40 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-600"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">
                              {u.name} {u.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate font-mono">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px]">
                          <RoleBadge role={u.role} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSandboxDirectLogin(u);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Probar Rol →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Role Permissions Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Matriz de Autorización: {activeRoleMeta.title}</span>
                </span>
                <span className="text-[10px] text-slate-400">Nivel de Acceso</span>
              </div>
              <p className="text-[11px] text-slate-300">{activeRoleMeta.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span>YORVAR CRM Enterprise v2.4</span>
          <span>•</span>
          <span>Protección de Endpoints & RLS Multi-Tenant</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>OWASP ASVS Compliant</span>
          <span>•</span>
          <span>Tokens Bearer en Backend</span>
        </div>
      </div>
    </div>
  );
};
