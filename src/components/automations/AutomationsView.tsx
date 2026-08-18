import React, { useState } from "react";
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
  Clock,
  Send,
  UserCheck,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { AutomationRule, TriggerType, ActionType } from "../../types/automations";

export const AutomationsView: React.FC = () => {
  const { automations = [], addAutomation, updateAutomation, deleteAutomation, leads = [], users = [] } = useCRM();
  const { hasPermission, currentUser } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<TriggerType>("lead_score_exceeded");
  const [actionType, setActionType] = useState<ActionType>("assign_user");
  const [assignedUserId, setAssignedUserId] = useState(users[0]?.id || "");

  const handleToggle = (rule: AutomationRule) => {
    updateAutomation(rule.id, { isActive: !rule.isActive });
  };

  const handleSimulateRule = (rule: AutomationRule) => {
    updateAutomation(rule.id, {
      timesExecuted: (rule.timesExecuted || 0) + 1,
      lastExecutedAt: new Date().toISOString(),
    });
    setSimulationNotice(`¡Regla "${rule.name}" ejecutada con éxito! Se procesaron los prospectos que coinciden.`);
    setTimeout(() => setSimulationNotice(null), 4000);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedUser = users.find((u) => u.id === assignedUserId);

    const newRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      name,
      description,
      trigger,
      conditions: [
        {
          field: "score",
          operator: "greater_than",
          value: 70,
        },
      ],
      actions: [
        {
          type: actionType,
          params: {
            assignedToUserId: assignedUserId,
            assignedToName: assignedUser ? `${assignedUser.name} ${assignedUser.lastName}` : "Director",
          },
        },
      ],
      isActive: true,
      timesExecuted: 0,
      createdAt: new Date().toISOString(),
    };

    addAutomation(newRule);
    setIsModalOpen(false);
    setName("");
    setDescription("");
  };

  const getTriggerLabel = (t: TriggerType) => {
    switch (t) {
      case "lead_score_exceeded":
        return "Lead supera Score crítico (>70 pts)";
      case "lead_created":
        return "Nuevo Lead ingresa al CRM";
      case "lead_status_changed":
        return "Estado del Lead cambia a 'Calificado'";
      case "email_replied":
        return "El prospecto responde a un correo";
      case "meeting_scheduled":
        return "Reunión comercial agendada";
      case "opportunity_stage_changed":
        return "Oportunidad avanza de etapa en Pipeline";
      case "days_without_activity":
        return "Más de 5 días sin contacto o actividad";
      default:
        return t;
    }
  };

  const getActionLabel = (a: ActionType) => {
    switch (a) {
      case "assign_user":
        return "Asignar automáticamente a Ejecutivo / SDR";
      case "create_task":
        return "Crear tarea comercial urgente con recordatorio";
      case "enroll_in_sequence":
        return "Inscribir en Cadencia de Seguimiento";
      case "change_status":
        return "Cambiar estado de calificación del lead";
      case "send_email_template":
        return "Enviar correo de presentación personalizado";
      case "add_score":
        return "Incrementar Lead Score (+25 pts)";
      default:
        return a;
    }
  };

  const activeCount = automations.filter((a) => a.isActive).length;
  const totalExecutions = automations.reduce((acc, curr) => acc + (curr.timesExecuted || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Motor de Automatizaciones</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Flujos de trabajo automáticos basados en eventos, scoring y cambios en el pipeline.
              </p>
            </div>
          </div>
        </div>

        {hasPermission("settings.view") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Automatización</span>
          </button>
        )}
      </div>

      {simulationNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{simulationNotice}</span>
          </div>
          <button onClick={() => setSimulationNotice(null)} className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Reglas Activas</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{activeCount} / {automations.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Ejecuciones Totales</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalExecutions}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Ahorro Estimado</p>
            <p className="text-2xl font-black text-slate-900 mt-1">~18.5 hrs / mes</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Rules list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Reglas de Automatización Configuradas ({automations.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {automations.map((rule) => {
            const firstAction = rule.actions?.[0];
            return (
              <div
                key={rule.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rule.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {rule.isActive ? "ACTIVA" : "PAUSADA"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                  </div>

                  <p className="text-xs text-slate-500">{rule.description}</p>

                  {/* Flow Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>SI: {getTriggerLabel(rule.trigger)}</span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

                    <div className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ENTONCES: {firstAction ? getActionLabel(firstAction.type) : "Ejecutar acción"}</span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                    <p className="font-bold text-slate-700">{rule.timesExecuted || 0} ejecuciones</p>
                    <p className="text-[10px]">
                      {rule.lastExecutedAt
                        ? `Última: ${new Date(rule.lastExecutedAt).toLocaleDateString()}`
                        : "Sin ejecuciones"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSimulateRule(rule)}
                    title="Ejecutar prueba manual"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden sm:inline">Probar</span>
                  </button>

                  <button
                    onClick={() => handleToggle(rule)}
                    className="p-1 text-slate-600 hover:text-slate-900"
                    title={rule.isActive ? "Pausar regla" : "Activar regla"}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>

                  {hasPermission("settings.view") && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar regla "${rule.name}"?`)) {
                          deleteAutomation(rule.id);
                        }
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Automation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Crear Nueva Automatización</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Automatización *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Auto-asignar Leads Calientes a Ejecutivo Senior"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción del Flujo</label>
                <input
                  type="text"
                  placeholder="Ej: Cuando un lead supera 70 puntos, asignarlo inmediatamente y enviar notificación"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-amber-900">1. Disparador / Trigger (CUANDO)</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as TriggerType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white"
                >
                  <option value="lead_score_exceeded">Lead supera Score de 70 puntos (Lead Caliente)</option>
                  <option value="lead_created">Nuevo Lead ingresa desde formulario web o CSV</option>
                  <option value="lead_status_changed">Estado del Lead cambia a 'Calificado'</option>
                  <option value="email_replied">El prospecto responde a un correo de prospección</option>
                  <option value="meeting_scheduled">Se agenda una reunión en el calendario</option>
                  <option value="days_without_activity">Sin contacto comercial por más de 5 días</option>
                </select>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-indigo-900">2. Acción Automatizada (ENTONCES)</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 bg-white"
                >
                  <option value="assign_user">Asignar automáticamente a un Vendedor</option>
                  <option value="create_task">Generar Tarea Comercial con SLA de 2 horas</option>
                  <option value="enroll_in_sequence">Inscribir en Cadencia de Email de Alto Valor</option>
                  <option value="change_status">Actualizar estado del prospecto a Calificado</option>
                  <option value="add_score">Aumentar Lead Score en +25 puntos</option>
                </select>

                {actionType === "assign_user" && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Seleccionar Vendedor:</label>
                    <select
                      value={assignedUserId}
                      onChange={(e) => setAssignedUserId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.lastName} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Guardar y Activar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
