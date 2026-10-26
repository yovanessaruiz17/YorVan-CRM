import React from "react";
import {
  ShieldCheck,
  Check,
  X,
  XCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  Info,
  Layers,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useAuth } from "../../context/AuthContext";
import { ROLE_METADATA } from "../../data/initialConfig";
import { RoleBadge } from "../common/Badge";

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, allPermissions, hasPermission } = useAuth();
  const roleMeta = ROLE_METADATA[currentUser.role] || ROLE_METADATA.super_admin;

  const categories = [
    { key: "leads", label: "Prospectos & Leads" },
    { key: "contacts", label: "Contactos" },
    { key: "companies", label: "Empresas" },
    { key: "opportunities", label: "Pipeline & Oportunidades" },
    { key: "tasks", label: "Tareas & Seguimiento" },
    { key: "campaigns", label: "Campañas & Email" },
    { key: "reports", label: "Reportes & Analítica" },
    { key: "users", label: "Gestión de Usuarios" },
    { key: "settings", label: "Configuración & Supabase" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permisos y Privilegios del Rol"
      subtitle={`Usuario: ${currentUser.name} ${currentUser.lastName} (${currentUser.jobTitle})`}
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Role Overview Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {currentUser.name} {currentUser.lastName}
                </span>
                <RoleBadge role={currentUser.role} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{roleMeta.description}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Nivel de Acceso
            </span>
            <span className="font-bold text-indigo-700 text-xs">{roleMeta.title}</span>
          </div>
        </div>

        {/* Key Restrictions Notice */}
        {roleMeta.restrictedActions.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Acciones Restringidas para tu Rol:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-amber-900/90 pl-1">
              {roleMeta.restrictedActions.map((ra, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{ra}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Permissions Grid by Category */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Matriz de Permisos Detallada</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
            {categories.map((cat) => {
              const permsInCat = allPermissions.filter((p) => p.category === cat.key);
              if (!permsInCat.length) return null;

              return (
                <div
                  key={cat.key}
                  className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                >
                  <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1 text-[11px]">
                    {cat.label}
                  </span>

                  <div className="space-y-1.5">
                    {permsInCat.map((perm) => {
                      const allowed = hasPermission(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className="flex items-start justify-between gap-1.5"
                          title={perm.description}
                        >
                          <span
                            className={`text-[11px] leading-tight ${
                              allowed ? "font-semibold text-slate-800" : "text-slate-400 line-through"
                            }`}
                          >
                            {perm.name}
                          </span>
                          {allowed ? (
                            <span className="p-0.5 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="p-0.5 rounded-md bg-rose-100 text-rose-600 shrink-0">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Los permisos están gobernados por el Control de Acceso Basado en Roles (RBAC).</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
};
