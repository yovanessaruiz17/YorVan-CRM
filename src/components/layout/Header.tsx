import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Plus,
  Compass,
  RotateCcw,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCRM } from "../../context/CRMContext";
import { RoleBadge } from "../common/Badge";

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAI: () => void;
  onOpenNotifications: () => void;
  onOpenOnboarding: () => void;
  onOpenNewLead: () => void;
  onOpenNewOpportunity: () => void;
  onOpenNewTask: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAI,
  onOpenNotifications,
  onOpenOnboarding,
  onOpenNewLead,
  onOpenNewOpportunity,
  onOpenNewTask,
  onToggleMobileSidebar,
}) => {
  const { currentUser, users = [], switchUser } = useAuth();
  const { notifications = [], resetToDemoData } = useCRM();

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile toggle & Global search input */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200/70 rounded-lg border border-slate-200 w-48 sm:w-72 transition-colors text-left"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 truncate">Buscar leads, empresas, tareas...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Onboarding Wizard button */}
        <button
          onClick={onOpenOnboarding}
          title="Asistente de Configuración Inicial"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Guía Onboarding</span>
        </button>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Crear</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showQuickCreate && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowQuickCreate(false)}
            >
              <button
                onClick={onOpenNewLead}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Nuevo Prospecto (Lead)
              </button>
              <button
                onClick={onOpenNewOpportunity}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Nueva Oportunidad
              </button>
              <button
                onClick={onOpenNewTask}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Nueva Tarea / Llamada
              </button>
            </div>
          )}
        </div>

        {/* Notifications Trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Quick Role & User Switcher for testing RBAC */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Cambiar Usuario / Rol (Prueba de RBAC)"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-md object-cover"
            />
            <div className="hidden xl:block text-left text-xs">
              <span className="font-bold text-slate-800 block leading-tight">{currentUser.name}</span>
            </div>
            <RoleBadge role={currentUser.role} />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setShowRoleSwitcher(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Simulador de Roles (RBAC)
                  </span>
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cambia de usuario para verificar permisos en vivo.
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        isCurrent
                          ? "bg-indigo-50 border border-indigo-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-md object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {u.name} {u.lastName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{u.jobTitle}</p>
                        </div>
                      </div>
                      <RoleBadge role={u.role} />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("¿Deseas restablecer todos los datos a la versión demo inicial?")) {
                      resetToDemoData();
                      setShowRoleSwitcher(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Datos Demo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
