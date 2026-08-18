import React from "react";
import {
  CheckSquare,
  Flame,
  Phone,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { ScoreBadge, PriorityBadge, LeadStatusBadge } from "../common/Badge";

interface SalesDashboardProps {
  onNavigate: (section: any, entityId?: string) => void;
  onOpenAI: () => void;
  onSelectLead: (leadId: string) => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  onNavigate,
  onOpenAI,
  onSelectLead,
}) => {
  const { currentUser } = useAuth();
  const { leads, tasks, opportunities, toggleTaskStatus } = useCRM();

  // Filter tasks for current user or all if admin
  const isAE = currentUser.role === "vendedor" || currentUser.role === "admin_comercial" || currentUser.role === "super_admin";

  const userTasks = tasks.filter(
    (t) => currentUser.role === "super_admin" || t.assignedToUserId === currentUser.id
  );

  const pendingTasks = userTasks.filter((t) => t.status === "pendiente");
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate < todayStr);
  const todayTasks = pendingTasks.filter((t) => t.dueDate === todayStr);

  const hotLeads = leads
    .filter((l) => l.scoreLevel === "muy_caliente" || l.scoreLevel === "caliente")
    .sort((a, b) => b.score - a.score);

  const activeProposals = opportunities.filter(
    (o) => o.stage === "propuesta_enviada" || o.stage === "negociacion"
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: ¿Qué tengo que hacer hoy? */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Plan de Acción Diario — {currentUser.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {pendingTasks.length} pendientes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioriza llamadas a prospectos calientes y seguimiento a propuestas en negociación.
            </p>
          </div>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sugerir Prioridades con IA</span>
          </button>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60">
            <span className="text-[11px] font-semibold text-amber-700 uppercase">Para Hoy</span>
            <p className="text-xl font-bold text-amber-900 mt-0.5">{todayTasks.length} tareas</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/60">
            <span className="text-[11px] font-semibold text-rose-700 uppercase">Vencidas</span>
            <p className="text-xl font-bold text-rose-900 mt-0.5">{overdueTasks.length} alertas</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/60">
            <span className="text-[11px] font-semibold text-indigo-700 uppercase">Leads Calientes</span>
            <p className="text-xl font-bold text-indigo-900 mt-0.5">{hotLeads.length} leads</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase">Propuestas en Vuelo</span>
            <p className="text-xl font-bold text-emerald-900 mt-0.5">{activeProposals.length} negocios</p>
          </div>
        </div>
      </div>

      {/* Actionable Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending & Overdue Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Tareas Prioritarias</h3>
            </div>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Ver todas
            </button>
          </div>

          <div className="flex-1 space-y-2.5">
            {!pendingTasks.length ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                ¡Excelente! No tienes tareas pendientes para hoy.
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task) => {
                const isOverdue = task.dueDate < todayStr;
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isOverdue
                        ? "bg-rose-50/30 border-rose-200"
                        : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Marcar como completada"
                      >
                        <div className="w-4 h-4 rounded border border-slate-300 hover:border-emerald-500 bg-white" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {task.companyName} {task.leadName ? `· ${task.leadName}` : ""}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <PriorityBadge priority={task.priority} />
                          <span
                            className={`text-[10px] font-semibold ${
                              isOverdue ? "text-rose-600" : "text-slate-500"
                            }`}
                          >
                            {isOverdue ? `⚠️ Venció el ${task.dueDate}` : `Hoy, ${task.dueTime}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Hot Leads to Contact */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">Prospectos Calientes (Acción Inmediata)</h3>
            </div>
            <button
              onClick={() => onNavigate("leads")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Ver leads
            </button>
          </div>

          <div className="flex-1 space-y-2.5">
            {hotLeads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead.id)}
                className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {lead.name} {lead.lastName}
                    </p>
                    <ScoreBadge score={lead.score} level={lead.scoreLevel} />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {lead.company} · {lead.jobTitle}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLead(lead.id);
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg shrink-0 transition-colors"
                  title="Contactar o ver ficha 360°"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
