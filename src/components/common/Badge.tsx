import React from "react";
import { LeadScoreLevel, LeadStatus, TaskPriority, TaskStatus } from "../../types/crm";
import { UserRole } from "../../types/auth";

export const ScoreBadge: React.FC<{ score: number; level: LeadScoreLevel }> = ({ score, level }) => {
  const configs = {
    frio: { label: "Frío", bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
    tibio: { label: "Tibio", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    caliente: { label: "Caliente", bg: "bg-amber-50 text-amber-800 border-amber-300", dot: "bg-amber-500" },
    muy_caliente: { label: "Muy Caliente", bg: "bg-rose-50 text-rose-700 border-rose-300", dot: "bg-rose-500 animate-pulse" },
  };

  const c = configs[level] || configs.frio;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{score} pts</span>
      <span className="opacity-70 font-normal">({c.label})</span>
    </span>
  );
};

export const LeadStatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const map: Record<LeadStatus, { label: string; style: string }> = {
    nuevo: { label: "Nuevo", style: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    en_prospeccion: { label: "En Prospección", style: "bg-blue-50 text-blue-700 border-blue-200" },
    contactado: { label: "Contactado", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    respondio: { label: "Respondió", style: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold" },
    calificado: { label: "Calificado", style: "bg-purple-50 text-purple-700 border-purple-200" },
    no_interesado: { label: "No Interesado", style: "bg-stone-100 text-stone-600 border-stone-200" },
    no_contactar: { label: "No Contactar", style: "bg-rose-100 text-rose-800 border-rose-300" },
    convertido: { label: "Convertido", style: "bg-teal-50 text-teal-700 border-teal-300 font-bold" },
    perdido: { label: "Perdido", style: "bg-red-50 text-red-700 border-red-200" },
  };

  const config = map[status] || { label: status, style: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${config.style}`}>
      {config.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const map: Record<UserRole, { label: string; style: string }> = {
    super_admin: { label: "Super Admin", style: "bg-purple-100 text-purple-800 border-purple-300" },
    admin_comercial: { label: "Admin Comercial", style: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    gerente_comercial: { label: "Gerente Comercial", style: "bg-blue-100 text-blue-800 border-blue-300" },
    vendedor: { label: "Vendedor / AE", style: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    sdr: { label: "SDR / Prospección", style: "bg-amber-100 text-amber-800 border-amber-300" },
    marketing: { label: "Marketing", style: "bg-pink-100 text-pink-800 border-pink-300" },
    soporte: { label: "Customer Success", style: "bg-teal-100 text-teal-800 border-teal-300" },
  };

  const config = map[role] || { label: role, style: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.style}`}>
      {config.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const map: Record<TaskPriority, { label: string; style: string }> = {
    urgente: { label: "Urgente", style: "bg-rose-50 text-rose-700 border-rose-300 font-bold" },
    alta: { label: "Alta", style: "bg-amber-50 text-amber-700 border-amber-300" },
    media: { label: "Media", style: "bg-blue-50 text-blue-700 border-blue-200" },
    baja: { label: "Baja", style: "bg-slate-100 text-slate-600 border-slate-200" },
  };

  const c = map[priority] || map.media;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c.style}`}>
      {c.label}
    </span>
  );
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const map: Record<TaskStatus, { label: string; style: string }> = {
    pendiente: { label: "Pendiente", style: "bg-amber-50 text-amber-700 border-amber-200" },
    en_progreso: { label: "En Progreso", style: "bg-blue-50 text-blue-700 border-blue-200" },
    completada: { label: "Completada", style: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium" },
    cancelada: { label: "Cancelada", style: "bg-gray-100 text-gray-600 border-gray-200" },
  };

  const c = map[status] || map.pendiente;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${c.style}`}>
      {c.label}
    </span>
  );
};
