import React, { useState } from "react";
import {
  UserCog,
  UserPlus,
  Plus,
  TrendingUp,
  Target,
  DollarSign,
  KanbanSquare,
  Users,
  Award,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Lock,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { User, UserRole } from "../../types/auth";
import { RoleBadge } from "../common/Badge";
import { formatCurrencyCOP, ROLE_METADATA } from "../../data/initialConfig";
import { EmployeeModal } from "./EmployeeModal";

export const TeamView: React.FC = () => {
  const { opportunities = [], leads = [], companySettings } = useCRM();
  const {
    currentUser,
    users = [],
    switchUser,
    hasPermission,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useAuth();

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const isSuperAdmin = currentUser.role === "super_admin";
  const canManageUsers = isSuperAdmin || hasPermission("users.create") || hasPermission("users.edit");

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEmployeeToEdit(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEmployeeToEdit(user);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (
    employeeData: Omit<User, "id" | "createdAt">,
    isEdit: boolean,
    userId?: string
  ) => {
    if (isEdit && userId) {
      updateUser(userId, employeeData);
      showNotification(`Empleado "${employeeData.name} ${employeeData.lastName}" actualizado con éxito.`);
    } else {
      addUser(employeeData);
      showNotification(`Nuevo empleado "${employeeData.name} ${employeeData.lastName}" creado con sus permisos asignados.`);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${userName}"? Esta acción no se puede deshacer.`)) {
      const res = deleteUser(userId);
      if (res.success) {
        showNotification(`Empleado "${userName}" eliminado correctamente.`);
      } else {
        alert(res.error || "No fue posible eliminar al usuario.");
      }
    }
  };

  // Calculate stats for each user
  const getUserStats = (userId: string) => {
    const userDeals = (opportunities || []).filter((o) => o.assignedToUserId === userId);
    const wonDeals = userDeals.filter((o) => o.stage === "cierre_ganado" || o.stage === "ganada");
    const openDeals = userDeals.filter((o) => o.stage !== "cierre_ganado" && o.stage !== "cierre_perdido" && o.stage !== "perdida");
    const userLeads = (leads || []).filter((l) => l.assignedToUserId === userId);

    const closedRevenue = wonDeals.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const pipelineValue = openDeals.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const winRate = userDeals.length > 0 ? Math.round((wonDeals.length / userDeals.length) * 100) : 0;

    return {
      totalDeals: userDeals.length,
      openDealsCount: openDeals.length,
      wonDealsCount: wonDeals.length,
      closedRevenue,
      pipelineValue,
      leadsCount: userLeads.length,
      winRate,
    };
  };

  const currency = companySettings?.currency || "COP";

  // Filter users
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.name} ${u.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const nonAdminUsers = users.filter((u) => u.role !== "super_admin");

  return (
    <div className="space-y-6">
      {/* Top Banner / Toast Notification */}
      {notificationMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <UserCog className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gestión de Empleados & Roles</h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                  {users.length} {users.length === 1 ? "Usuario" : "Usuarios"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Crea a los empleados de tu empresa, asigna sus roles comerciales y personaliza sus permisos de acceso (RBAC).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManageUsers && (
            <button
              onClick={handleOpenCreateModal}
              className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-600/25 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Empleado</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span>Sesión Actual:</span>
            <span className="font-bold text-indigo-700">{currentUser.name} {currentUser.lastName}</span>
            <RoleBadge role={currentUser.role} />
          </div>
        </div>
      </div>

      {/* Super Admin Notice if No Employees Created Yet */}
      {nonAdminUsers.length === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Aún no has creado empleados para tu equipo comercial
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Como <strong>Super Administrador</strong>, puedes dar de alta a vendedores, ejecutivos SDR, directores comerciales y personal de soporte. El sistema precargará los permisos del rol seleccionado y podrás ajustar las acciones permitidas antes de guardar.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Primer Empleado</span>
          </button>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos los Roles ({users.length})</option>
            <option value="super_admin">Super Admin</option>
            <option value="gerente_comercial">Gerente Comercial</option>
            <option value="admin_comercial">Admin Comercial</option>
            <option value="vendedor">Vendedor / AE</option>
            <option value="sdr">SDR (Outbound)</option>
            <option value="marketing">Marketing</option>
            <option value="soporte">Soporte</option>
          </select>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user.id);
          const quota = user.monthlyQuota || 50000000;
          const quotaPercent = quota > 0 ? Math.min(100, Math.round((stats.closedRevenue / quota) * 100)) : 0;
          const isCurrentUser = currentUser.id === user.id;
          const isUserAdmin = user.role === "super_admin";
          const permCount = user.customPermissions ? user.customPermissions.length : (ROLE_METADATA[user.role]?.keyPermissions.length || 0);

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-xs flex flex-col justify-between ${
                isCurrentUser
                  ? "border-indigo-400 ring-2 ring-indigo-500/20"
                  : user.status === "inactive"
                  ? "border-slate-200 bg-slate-50/60 opacity-80"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {user.name} {user.lastName}
                        </h3>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.jobTitle}</p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <RoleBadge role={user.role} />
                        {user.status === "inactive" ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            Inactivo
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Activo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Quick Switch */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isCurrentUser && (
                      <button
                        onClick={() => switchUser(user.id)}
                        title="Probar plataforma con los permisos de este empleado"
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 transition-colors"
                      >
                        Simular
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact info & Permissions Badge */}
                <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-indigo-700 font-semibold pt-0.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      {isUserAdmin ? "Acceso Total Irrestricto" : `${permCount} permisos configurados`}
                    </span>
                  </div>
                </div>

                {/* Quota Progress (if applicable) */}
                {quota > 0 && user.role !== "soporte" && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 mt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <Target className="w-3 h-3 text-indigo-600" />
                        Meta Mensual:
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrencyCOP(quota)} {currency}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quotaPercent >= 80 ? "bg-emerald-500" : quotaPercent >= 40 ? "bg-amber-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">
                        Cerrado: <strong className="text-slate-800">{formatCurrencyCOP(stats.closedRevenue)}</strong>
                      </span>
                      <span className="font-bold text-indigo-700">{quotaPercent}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions: Edit Permissions, Toggle Status, Delete */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {canManageUsers && (
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                      title="Editar datos, rol y permisos"
                    >
                      <Edit3 className="w-3 h-3 text-slate-600" />
                      <span>Editar / Permisos</span>
                    </button>
                  )}

                  {!isUserAdmin && canManageUsers && (
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                        user.status === "active"
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                      }`}
                      title={user.status === "active" ? "Desactivar acceso" : "Reactivar acceso"}
                    >
                      {user.status === "active" ? "Suspender" : "Activar"}
                    </button>
                  )}
                </div>

                {!isUserAdmin && canManageUsers && (
                  <button
                    onClick={() => handleDeleteUser(user.id, `${user.name} ${user.lastName}`)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Eliminar empleado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating / Editing Employee */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
        existingUsers={users}
      />
    </div>
  );
};

