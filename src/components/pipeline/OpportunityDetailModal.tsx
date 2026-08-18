import React, { useState } from "react";
import {
  DollarSign,
  Building2,
  Calendar,
  User,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  Trophy,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { formatCurrencyCOP } from "../../data/initialConfig";
import { requestAIAssistant } from "../../services/geminiService";

interface OpportunityDetailModalProps {
  opportunityId: string | null;
  onClose: () => void;
  onEdit: (oppId: string) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunityId,
  onClose,
  onEdit,
}) => {
  const {
    opportunities,
    pipelineStages,
    updateOpportunity,
    deleteOpportunity,
    activities,
    addActivity,
    tasks,
    addTask,
    toggleTaskStatus,
  } = useCRM();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"info" | "timeline" | "tasks" | "ai">("info");
  const [newNote, setNewNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().slice(0, 10));

  // AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const opp = opportunities.find((o) => o.id === opportunityId);
  if (!opp) return null;

  const currentStage = pipelineStages.find((s) => s.id === opp.stage);
  const oppActivities = activities.filter((a) => a.opportunityId === opp.id || a.companyName === opp.companyName);
  const oppTasks = tasks.filter((t) => t.opportunityId === opp.id || t.companyName === opp.companyName);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addActivity({
      type: "nota",
      title: "Nota comercial en oportunidad",
      description: newNote,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`,
      opportunityId: opp.id,
      companyName: opp.companyName,
    });

    setNewNote("");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      description: `Acción para avanzar el negocio ${opp.title}`,
      assignedToUserId: currentUser.id,
      assignedToName: `${currentUser.name} ${currentUser.lastName}`,
      createdByUserId: currentUser.id,
      createdByName: `${currentUser.name} ${currentUser.lastName}`,
      dueDate: taskDueDate,
      dueTime: "11:00",
      priority: "alta",
      status: "pendiente",
      opportunityId: opp.id,
      companyName: opp.companyName,
      type: "reunion",
    });

    setTaskTitle("");
  };

  const handleRunAI = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await requestAIAssistant({
        type: "deal_risk_analysis",
        opportunityData: opp,
      });
      setAiResult(res.result);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!opportunityId}
      onClose={onClose}
      title={opp.title}
      subtitle={`${opp.companyName} · Contacto: ${opp.contactName}`}
      maxWidth="3xl"
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl mb-5">
        <div className="flex items-center gap-3">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs"
            style={{ backgroundColor: currentStage?.color || "#6366f1" }}
          >
            {currentStage?.name} ({opp.probability}%)
          </span>
          <span className="text-sm font-extrabold text-slate-900">
            {formatCurrencyCOP(opp.value)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(opp.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-5 pb-1">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "info" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Detalles del Negocio
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "timeline" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Actividades</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {oppActivities.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "tasks" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Tareas</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {oppTasks.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "ai" ? "bg-purple-50 text-purple-700" : "text-purple-600 hover:bg-purple-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Deal Health</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "info" && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
            <div className="space-y-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Datos Económicos
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Total:</span>
                <span className="font-bold text-slate-900">{formatCurrencyCOP(opp.value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Ponderado:</span>
                <span className="font-bold text-indigo-700">{formatCurrencyCOP(opp.weightedValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Probabilidad:</span>
                <span className="font-semibold text-slate-800">{opp.probability}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Tiempos & Responsable
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Cierre Estimado:</span>
                <span className="font-semibold text-slate-800">{opp.expectedCloseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Responsable:</span>
                <span className="font-semibold text-indigo-700">{opp.assignedToName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prioridad:</span>
                <span className="font-bold uppercase text-slate-800">{opp.priority}</span>
              </div>
            </div>
          </div>

          {opp.description && (
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
              <h5 className="font-bold text-slate-700 mb-1">Descripción y Alcance:</h5>
              <p className="text-slate-600 leading-relaxed">{opp.description}</p>
            </div>
          )}

          {opp.wonNotes && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
              <span className="font-bold block">Notas de Cierre Ganado:</span>
              <p className="mt-0.5">{opp.wonNotes}</p>
            </div>
          )}

          {opp.lostReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <span className="font-bold block">Motivo de Pérdida:</span>
              <p className="mt-0.5">{opp.lostReason}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="space-y-4">
          <form onSubmit={handleAddActivity} className="flex gap-2">
            <input
              type="text"
              placeholder="Escribir nota sobre avances comerciales..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
            >
              Guardar
            </button>
          </form>

          <div className="space-y-2">
            {!oppActivities.length ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No hay actividades registradas en esta oportunidad.
              </div>
            ) : (
              oppActivities.map((act) => (
                <div key={act.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{act.title}</span>
                    <span className="text-slate-400">{new Date(act.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600">{act.description}</p>
                  <span className="text-[10px] text-slate-400 block">Por: {act.userName}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-4">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="Nueva tarea de seguimiento..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg font-medium"
            />
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
            >
              Agregar
            </button>
          </form>

          <div className="space-y-2">
            {!oppTasks.length ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No hay tareas pendientes en esta oportunidad.
              </div>
            ) : (
              oppTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={t.status === "completada"}
                      onChange={() => toggleTaskStatus(t.id)}
                      className="rounded text-indigo-600"
                    />
                    <span className={t.status === "completada" ? "line-through text-slate-400" : "font-semibold text-slate-800"}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{t.dueDate}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="space-y-4">
          <button
            onClick={handleRunAI}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiLoading ? "Analizando salud del negocio con Gemini..." : "Evaluar Riesgos & Estrategia de Cierre"}</span>
          </button>

          {aiResult && (
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900">Salud del Negocio:</span>
                <span className="px-2.5 py-0.5 rounded-full font-extrabold bg-purple-200 text-purple-800 uppercase text-[10px]">
                  {aiResult.dealHealth} (Riesgo: {aiResult.riskLevel})
                </span>
              </div>

              {aiResult.redFlags?.length > 0 && (
                <div>
                  <span className="font-bold text-rose-800 block mb-1">Riesgos / Alertas detectadas:</span>
                  <ul className="list-disc pl-4 space-y-1 text-rose-700">
                    {aiResult.redFlags.map((flag: string, idx: number) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResult.recommendations?.length > 0 && (
                <div>
                  <span className="font-bold text-purple-900 block mb-1">Recomendaciones para acelerar el cierre:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {aiResult.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
