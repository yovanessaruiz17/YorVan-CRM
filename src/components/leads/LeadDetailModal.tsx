import React, { useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  CheckSquare,
  MessageSquare,
  Clock,
  Plus,
  Send,
  Trophy,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { ScoreBadge, LeadStatusBadge, PriorityBadge } from "../common/Badge";
import { requestAIAssistant } from "../../services/geminiService";
import { interpolateTemplateVariables } from "../../services/emailDeliverabilityService";

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
  onEditLead: (leadId: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  leadId,
  onClose,
  onEditLead,
}) => {
  const { leads, updateLead, deleteLead, activities, addActivity, tasks, addTask, toggleTaskStatus, convertLeadToOpportunity, templates } = useCRM();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"info" | "timeline" | "tasks" | "email" | "ai">("info");

  // Activity log state
  const [newNote, setNewNote] = useState("");
  const [newActivityType, setNewActivityType] = useState<any>("llamada");

  // Task creation state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [taskPriority, setTaskPriority] = useState<any>("alta");

  // Email draft state
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  // AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const lead = leads.find((l) => l.id === leadId);

  if (!lead) return null;

  const leadActivities = activities.filter((a) => a.leadId === lead.id);
  const leadTasks = tasks.filter((t) => t.leadId === lead.id);

  // Add new activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addActivity({
      type: newActivityType,
      title: `Registro de ${newActivityType}`,
      description: newNote,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`,
      leadId: lead.id,
      leadName: `${lead.name} ${lead.lastName}`,
      companyName: lead.company,
    });

    // Score boost on interaction
    updateLead(lead.id, {
      score: lead.score + 10,
      lastContactedAt: new Date().toISOString(),
      status: lead.status === "nuevo" ? "contactado" : lead.status,
    });

    setNewNote("");
  };

  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      description: `Seguimiento comercial con ${lead.name} (${lead.company})`,
      assignedToUserId: currentUser.id,
      assignedToName: `${currentUser.name} ${currentUser.lastName}`,
      createdByUserId: currentUser.id,
      createdByName: `${currentUser.name} ${currentUser.lastName}`,
      dueDate: taskDueDate,
      dueTime: "10:00",
      priority: taskPriority,
      status: "pendiente",
      leadId: lead.id,
      leadName: `${lead.name} ${lead.lastName}`,
      companyName: lead.company,
      type: "llamada",
    });

    setTaskTitle("");
  };

  // Template select
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      const vars = {
        nombre: lead.name,
        apellido: lead.lastName,
        empresa: lead.company,
        cargo: lead.jobTitle,
        vendedor: `${currentUser.name} ${currentUser.lastName}`,
        producto: "YORVAR CRM",
        industria: lead.industry,
        ciudad: lead.city,
      };
      setEmailSubject(interpolateTemplateVariables(tmpl.subject, vars));
      setEmailBody(interpolateTemplateVariables(tmpl.body, vars));
    }
  };

  // Send single email simulation
  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) return;

    addActivity({
      type: "email_enviado",
      title: `Email enviado: ${emailSubject}`,
      description: emailBody,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`,
      leadId: lead.id,
      leadName: `${lead.name} ${lead.lastName}`,
      companyName: lead.company,
    });

    updateLead(lead.id, {
      score: lead.score + 15,
      lastContactedAt: new Date().toISOString(),
      status: "contactado",
    });

    setEmailSentNotice(true);
    setTimeout(() => setEmailSentNotice(false), 4000);
  };

  // AI Assistant trigger
  const runAIAssistant = async (type: any) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await requestAIAssistant({
        type,
        leadData: lead,
      });
      setAiResult({ type, data: res.result });
      if (type === "draft_email" && res.result?.subject) {
        setEmailSubject(res.result.subject);
        setEmailBody(res.result.body);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!leadId}
      onClose={onClose}
      title={`${lead.name} ${lead.lastName}`}
      subtitle={`${lead.jobTitle} en ${lead.company} · ${lead.city}, ${lead.country}`}
      maxWidth="4xl"
    >
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl mb-5">
        <div className="flex items-center gap-3">
          <ScoreBadge score={lead.score} level={lead.scoreLevel} />
          <LeadStatusBadge status={lead.status} />
        </div>

        <div className="flex items-center gap-2">
          {lead.status !== "convertido" && (
            <button
              onClick={() => {
                convertLeadToOpportunity(lead.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Convertir a Oportunidad</span>
            </button>
          )}

          <button
            onClick={() => onEditLead(lead.id)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors"
            title="Editar Lead"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === "info" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Información 360°
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "timeline" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Actividades</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {leadActivities.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "tasks" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Tareas</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {leadTasks.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "email" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Enviar Email</span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "ai"
              ? "bg-purple-50 text-purple-700"
              : "text-purple-600 hover:bg-purple-50/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Copilot</span>
        </button>
      </div>

      {/* Tab: Info 360° */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-slate-400">
                Contacto
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{lead.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Teléfono:</span>
                <span className="font-semibold text-slate-900">{lead.phone}</span>
              </div>
              {lead.whatsapp && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span className="font-semibold text-emerald-700">{lead.whatsapp}</span>
                </div>
              )}
              {lead.linkedin && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">LinkedIn:</span>
                  <a
                    href={lead.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Ver Perfil <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-slate-400">
                Detalles Comerciales
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Empresa:</span>
                <span className="font-semibold text-slate-900">{lead.company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Industria:</span>
                <span className="font-semibold text-slate-900">{lead.industry || "General"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tamaño de Empresa:</span>
                <span className="font-semibold text-slate-900">{lead.companySize || "11-50"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Valor Estimado:</span>
                <span className="font-bold text-slate-900">
                  {lead.estimatedValue
                    ? `$${(lead.estimatedValue / 1000000).toFixed(1)}M ${lead.currency || "COP"}`
                    : "Por cotizar"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Responsable Asignado:</span>
                <span className="font-semibold text-indigo-700">
                  {lead.assignedToName || "Sin asignar"}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-2">Etiquetas / Tags:</span>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags?.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Timeline & Activities */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {/* Quick Note Input */}
          <form onSubmit={handleAddActivity} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <select
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
              >
                <option value="llamada">📞 Llamada</option>
                <option value="reunion">🤝 Reunión</option>
                <option value="nota">📝 Nota interna</option>
                <option value="whatsapp">💬 WhatsApp</option>
              </select>
              <input
                type="text"
                placeholder="Registrar notas del contacto..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>

          {/* Activities list */}
          <div className="space-y-3">
            {!leadActivities.length ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay actividades registradas para este prospecto.
              </div>
            ) : (
              leadActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900">{act.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{act.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Por: {act.userName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <form onSubmit={handleAddTask} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              placeholder="Nueva tarea de seguimiento..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
            />
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
            >
              Agregar
            </button>
          </form>

          <div className="space-y-2">
            {!leadTasks.length ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay tareas pendientes asignadas a este prospecto.
              </div>
            ) : (
              leadTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => toggleTaskStatus(t.id)}>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          t.status === "completada" ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                        }`}
                      >
                        {t.status === "completada" && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${t.status === "completada" ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {t.title}
                      </p>
                      <span className="text-[10px] text-slate-500">Vence: {t.dueDate}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Send Email */}
      {activeTab === "email" && (
        <div className="space-y-4">
          {emailSentNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Email enviado y registrado en el timeline del prospecto.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cargar Plantilla Predefinida:</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="">Seleccionar una plantilla...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Asunto:</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Asunto del correo..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cuerpo del Mensaje:</label>
            <textarea
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Escribe el mensaje o genera uno con el AI Copilot..."
              className="w-full p-3 text-xs border border-slate-200 rounded-lg font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => runAIAssistant("draft_email")}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? "Generando..." : "Redactar con IA"}</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={!emailSubject || !emailBody}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Correo</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: AI Copilot */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => runAIAssistant("summarize_lead")}
              disabled={aiLoading}
              className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-indigo-900">Resumir Ficha 360°</span>
              <span className="text-[10px] text-slate-500">Puntos de dolor y riesgos</span>
            </button>
            <button
              onClick={() => runAIAssistant("next_best_action")}
              disabled={aiLoading}
              className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-purple-900">Próxima Mejor Acción</span>
              <span className="text-[10px] text-slate-500">Recomendación estratégica</span>
            </button>
            <button
              onClick={() => runAIAssistant("draft_email")}
              disabled={aiLoading}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-emerald-900">Email Hiper-Personalizado</span>
              <span className="text-[10px] text-slate-500">Generar propuesta comercial</span>
            </button>
          </div>

          {aiLoading && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-indigo-600 font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analizando contexto del prospecto con Gemini AI...</span>
            </div>
          )}

          {aiResult && (
            <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Resultado del Asistente Comercial</span>
              </div>

              {aiResult.type === "summarize_lead" && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-800 font-medium">{aiResult.data.summary}</p>
                  {aiResult.data.keyPainPoints && (
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Puntos de dolor identificados:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {aiResult.data.keyPainPoints.map((pt: string, idx: number) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiResult.data.suggestedNextStep && (
                    <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-900 font-semibold mt-2">
                      💡 Próximo paso recomendado: {aiResult.data.suggestedNextStep}
                    </div>
                  )}
                </div>
              )}

              {aiResult.type === "next_best_action" && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900">{aiResult.data.actionTitle}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      Urgencia: {aiResult.data.urgency}
                    </span>
                  </div>
                  <p className="text-slate-600">{aiResult.data.reasoning}</p>
                  {aiResult.data.suggestedScript && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                      "{aiResult.data.suggestedScript}"
                    </div>
                  )}
                </div>
              )}

              {aiResult.type === "draft_email" && (
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-900">Asunto: {aiResult.data.subject}</p>
                  <p className="text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {aiResult.data.body}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
