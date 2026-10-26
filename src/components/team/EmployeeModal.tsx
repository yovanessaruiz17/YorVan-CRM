import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Shield,
  Key,
  Mail,
  User as UserIcon,
  Phone,
  Briefcase,
  DollarSign,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { User, UserRole, Permission } from "../../types/auth";
import {
  INITIAL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_METADATA,
} from "../../data/initialConfig";
import { RoleBadge } from "../common/Badge";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Omit<User, "id" | "createdAt">, isEdit: boolean, userId?: string) => void;
  employeeToEdit?: User | null;
  existingUsers: User[];
}

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
];

const DEFAULT_JOB_TITLES: Record<UserRole, string> = {
  super_admin: "Super Administrador & Director",
  gerente_comercial: "Gerente Comercial",
  admin_comercial: "Administrador de Operaciones Comerciales",
  vendedor: "Ejecutivo Comercial Senior (AE)",
  sdr: "Especialista en Prospección Outbound (SDR)",
  marketing: "Growth & Email Marketing Lead",
  soporte: "Customer Success Specialist",
};

const CATEGORIES: { key: Permission["category"]; label: string; icon: string }[] = [
  { key: "leads", label: "Prospectos & Leads (Prospección)", icon: "🎯" },
  { key: "contacts", label: "Contactos Comerciales", icon: "👤" },
  { key: "companies", label: "Cuentas & Empresas", icon: "🏢" },
  { key: "opportunities", label: "Pipeline & Negocios", icon: "💼" },
  { key: "tasks", label: "Tareas, Llamadas & Agenda", icon: "📅" },
  { key: "campaigns", label: "Campañas Masivas & Email", icon: "✉️" },
  { key: "reports", label: "Reportes & Analítica Comercial", icon: "📊" },
  { key: "users", label: "Gestión de Usuarios & Equipo", icon: "👥" },
  { key: "settings", label: "Configuraciones & Supabase", icon: "⚙️" },
];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  existingUsers,
}) => {
  const isEdit = Boolean(employeeToEdit);

  // Form states
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("vendedor");
  const [jobTitle, setJobTitle] = useState("Ejecutivo Comercial Senior (AE)");
  const [phone, setPhone] = useState("+57 300 000 0000");
  const [monthlyQuota, setMonthlyQuota] = useState<number>(50000000);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    DEFAULT_ROLE_PERMISSIONS.vendedor || []
  );

  const [activeTab, setActiveTab] = useState<"general" | "permissions">("general");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate state when editing or opening fresh
  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name || "");
      setLastName(employeeToEdit.lastName || "");
      setEmail(employeeToEdit.email || "");
      setPassword(""); // Clear password field on edit to prevent accidental exposure
      setRole(employeeToEdit.role || "vendedor");
      setJobTitle(employeeToEdit.jobTitle || DEFAULT_JOB_TITLES[employeeToEdit.role] || "");
      setPhone(employeeToEdit.phone || "");
      setMonthlyQuota(employeeToEdit.monthlyQuota || 50000000);
      setStatus(employeeToEdit.status || "active");
      setAvatar(employeeToEdit.avatar || DEFAULT_AVATARS[0]);

      if (employeeToEdit.customPermissions && employeeToEdit.customPermissions.length > 0) {
        setSelectedPermissions(employeeToEdit.customPermissions);
      } else {
        setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS[employeeToEdit.role] || []);
      }
    } else {
      // New employee defaults
      setName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("vendedor");
      setJobTitle(DEFAULT_JOB_TITLES.vendedor);
      setPhone("+57 ");
      setMonthlyQuota(50000000);
      setStatus("active");
      const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      setAvatar(randomAvatar);
      setSelectedPermissions(DEFAULT_ROLE_PERMISSIONS.vendedor || []);
    }
    setErrorMsg(null);
    setActiveTab("general");
  }, [employeeToEdit, isOpen]);

  // Handle role change: auto-assign default permissions of the new role
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Auto update job title if it was default
    setJobTitle(DEFAULT_JOB_TITLES[newRole] || "");
    // Auto update permissions to role default
    const roleDefaults = DEFAULT_ROLE_PERMISSIONS[newRole] || [];
    setSelectedPermissions(roleDefaults);
  };

  const handleResetToRoleDefaults = () => {
    const roleDefaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
    setSelectedPermissions(roleDefaults);
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(INITIAL_PERMISSIONS.map((p) => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const toggleCategoryPermissions = (category: Permission["category"]) => {
    const categoryPermIds = INITIAL_PERMISSIONS.filter((p) => p.category === category).map((p) => p.id);
    const allSelected = categoryPermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !categoryPermIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...categoryPermIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Por favor ingresa un correo electrónico válido.");
      setActiveTab("general");
      return;
    }

    if (!name.trim() || !lastName.trim()) {
      setErrorMsg("El nombre y apellidos del empleado son obligatorios.");
      setActiveTab("general");
      return;
    }

    if (!isEdit && (!password.trim() || password.trim().length < 8)) {
      setErrorMsg("Debes asignarle una contraseña inicial de al menos 8 caracteres al nuevo empleado.");
      setActiveTab("general");
      return;
    }

    if (isEdit && password.trim() && password.trim().length < 8) {
      setErrorMsg("Si deseas cambiar la contraseña, debe contener al menos 8 caracteres.");
      setActiveTab("general");
      return;
    }

    // Check duplicate email
    const duplicate = existingUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && (!isEdit || u.id !== employeeToEdit?.id)
    );
    if (duplicate) {
      setErrorMsg(`El correo electrónico '${cleanEmail}' ya está en uso por ${duplicate.name} ${duplicate.lastName}.`);
      setActiveTab("general");
      return;
    }

    onSave(
      {
        name: name.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        password: password.trim(),
        role,
        jobTitle: jobTitle.trim() || DEFAULT_JOB_TITLES[role],
        phone: phone.trim(),
        monthlyQuota: Number(monthlyQuota) || 0,
        status,
        avatar,
        customPermissions: selectedPermissions,
      },
      isEdit,
      employeeToEdit?.id
    );

    onClose();
  };

  const roleMeta = ROLE_METADATA[role] || ROLE_METADATA.vendedor;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Editar Empleado: ${employeeToEdit?.name} ${employeeToEdit?.lastName}` : "Dar de Alta Nuevo Empleado"}
      subtitle={
        isEdit
          ? "Actualiza los datos, rol y permisos personalizados de este usuario."
          : "Crea la cuenta del empleado y personaliza sus permisos según su rol comercial."
      }
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Navigation Tabs inside Modal */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "general"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>1. Información & Rol</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("permissions")}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "permissions"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>2. Permisos del Empleado ({selectedPermissions.length} activos)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: General Info & Role Selection */}
        {activeTab === "general" && (
          <div className="space-y-4">
            {/* Role Selection Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Rol Comercial Asignado *</span>
                </label>
                <RoleBadge role={role} />
              </div>

              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="vendedor">Vendedor / Ejecutivo de Cuentas (Cierre y Cartera Comercial)</option>
                <option value="sdr">SDR / Prospección Outbound (Calificación de Leads)</option>
                <option value="gerente_comercial">Gerente Comercial (Supervisión de Pipeline y Metas)</option>
                <option value="admin_comercial">Administrador Comercial (Operaciones y Mantenimiento)</option>
                <option value="marketing">Marketing (Campañas Masivas y Automatizaciones)</option>
                <option value="soporte">Soporte & Éxito del Cliente (Seguimiento Post-Venta)</option>
                <option value="super_admin">Super Administrador (Acceso Completo Sin Restricciones)</option>
              </select>

              <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 text-[11px] text-slate-600 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">{roleMeta.title}: </span>
                  <span>{roleMeta.description}</span>
                  <p className="text-indigo-700 font-semibold mt-1">
                    ✓ Se han precargado {DEFAULT_ROLE_PERMISSIONS[role]?.length || 0} permisos estándar. Puedes revisarlos o modificarlos en la pestaña "2. Permisos".
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Carlos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Pérez Gómez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico (Login) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="empleado@yorvar.co"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contraseña de Acceso *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña inicial"
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo / Puesto Formal</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Ej. Ejecutivo de Cuentas Clave"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cuota Comercial Mensual (COP)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="1000000"
                    value={monthlyQuota}
                    onChange={(e) => setMonthlyQuota(Number(e.target.value))}
                    placeholder="50000000"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estado de la Cuenta</label>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setStatus("active")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      status === "active"
                        ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-500"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Activo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("inactive")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      status === "inactive"
                        ? "bg-rose-100 text-rose-800 border-2 border-rose-500"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Inactivo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Selecciona un Avatar para el Empleado</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      avatar === av ? "border-indigo-600 ring-2 ring-indigo-400" : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={av} alt="avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Permissions Matrix */}
        {activeTab === "permissions" && (
          <div className="space-y-4">
            {/* Header Toolbar */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Ajuste Fino de Permisos para el Rol: <span className="text-indigo-600">{roleMeta.title}</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedPermissions.length} de {INITIAL_PERMISSIONS.length} permisos habilitados para este usuario.
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetToRoleDefaults}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  title="Restablecer a los permisos sugeridos para este rol"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Por Defecto</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-colors"
                >
                  Marcar Todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllPermissions}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition-colors"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            {/* Categorized Permissions Grid */}
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-300">
              {CATEGORIES.map((cat) => {
                const categoryPermissions = INITIAL_PERMISSIONS.filter((p) => p.category === cat.key);
                if (categoryPermissions.length === 0) return null;

                const activeInCat = categoryPermissions.filter((p) => selectedPermissions.includes(p.id)).length;
                const allInCatActive = activeInCat === categoryPermissions.length;

                return (
                  <div key={cat.key} className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-bold text-slate-800 text-xs">{cat.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                          {activeInCat} / {categoryPermissions.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCategoryPermissions(cat.key)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                          allInCatActive
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        {allInCatActive ? "Desmarcar Grupo" : "Marcar Grupo"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {categoryPermissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`p-2 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                              isChecked
                                ? "bg-indigo-50/70 border-indigo-200 text-slate-900"
                                : "bg-slate-50 border-slate-200/80 text-slate-500 hover:bg-slate-100/60"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`font-bold text-xs ${isChecked ? "text-indigo-900" : "text-slate-700"}`}>
                                  {perm.name}
                                </span>
                                <span className="font-mono text-[9px] text-slate-400">{perm.id}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                {perm.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            {isEdit ? "Modificando usuario existente" : "Nuevo empleado listo para ingresar con su correo y contraseña"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEdit ? "Guardar Cambios" : "Crear Empleado"}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
