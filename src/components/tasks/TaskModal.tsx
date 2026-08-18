import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { TaskType, TaskPriority } from "../../types/crm";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskIdToEdit?: string | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskIdToEdit,
}) => {
  const {
    tasks = [],
    addTask,
    updateTask,
    users = [],
    leads = [],
    companies = [],
    opportunities = [],
  } = useCRM();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("llamada");
  const [priority, setPriority] = useState<TaskPriority>("alta");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueTime, setDueTime] = useState("10:00");
  const [assignedToUserId, setAssignedToUserId] = useState(currentUser.id);
  const [relatedType, setRelatedType] = useState<"lead" | "opportunity" | "company">("lead");
  const [relatedId, setRelatedId] = useState("");

  useEffect(() => {
    if (taskIdToEdit) {
      const t = tasks.find((item) => item.id === taskIdToEdit);
      if (t) {
        setTitle(t.title);
        setDescription(t.description || "");
        setType(t.type);
        setPriority(t.priority);
        setDueDate(t.dueDate);
        setDueTime(t.dueTime || "10:00");
        setAssignedToUserId(t.assignedToUserId);
      }
    } else {
      setTitle("");
      setDescription("");
      setType("llamada");
      setPriority("alta");
      setDueDate(new Date().toISOString().slice(0, 10));
      setDueTime("10:00");
      setAssignedToUserId(currentUser.id);
      setRelatedId(leads[0]?.id || "");
    }
  }, [taskIdToEdit, isOpen, tasks, currentUser.id, leads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Por favor ingresa un título para la tarea.");
      return;
    }

    const assigned = users.find((u) => u.id === assignedToUserId);

    let leadName, companyName, opportunityId;
    if (relatedType === "lead") {
      const l = leads.find((lead) => lead.id === relatedId);
      if (l) {
        leadName = `${l.name} ${l.lastName}`;
        companyName = l.company;
      }
    } else if (relatedType === "opportunity") {
      const o = opportunities.find((opp) => opp.id === relatedId);
      if (o) {
        opportunityId = o.id;
        companyName = o.companyName;
      }
    } else {
      const c = companies.find((comp) => comp.id === relatedId);
      if (c) companyName = c.name;
    }

    if (taskIdToEdit) {
      updateTask(taskIdToEdit, {
        title,
        description,
        type,
        priority,
        dueDate,
        dueTime,
        assignedToUserId,
        assignedToName: assigned ? `${assigned.name} ${assigned.lastName}` : "Vendedor",
      });
    } else {
      addTask({
        title,
        description,
        type,
        priority,
        status: "pendiente",
        dueDate,
        dueTime,
        assignedToUserId,
        assignedToName: assigned ? `${assigned.name} ${assigned.lastName}` : `${currentUser.name} ${currentUser.lastName}`,
        createdByUserId: currentUser.id,
        createdByName: `${currentUser.name} ${currentUser.lastName}`,
        leadId: relatedType === "lead" ? relatedId : undefined,
        leadName,
        companyName,
        opportunityId,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskIdToEdit ? "Editar Tarea" : "Nueva Tarea Comercial"}
      subtitle="Programa compromisos, llamadas, reuniones o seguimientos"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Título de la Tarea *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Llamada de demostración y presentación de propuesta"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tipo de Actividad</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              <option value="llamada">📞 Llamada Telefónica</option>
              <option value="reunion">🤝 Reunión / Demo</option>
              <option value="email">✉️ Envío de Correo</option>
              <option value="whatsapp">💬 Mensaje WhatsApp</option>
              <option value="propuesta">📄 Enviar Cotización</option>
              <option value="demo">💻 Demo de Software</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente 🔥</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Fecha Límite</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hora Estimada</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Vendedor Asignado</label>
            <select
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          {!taskIdToEdit && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vincular a:</label>
              <select
                value={relatedType}
                onChange={(e) => {
                  setRelatedType(e.target.value as any);
                  setRelatedId("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
              >
                <option value="lead">Prospecto (Lead)</option>
                <option value="opportunity">Negocio / Pipeline</option>
                <option value="company">Empresa / Cuenta</option>
              </select>
            </div>
          )}
        </div>

        {!taskIdToEdit && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">Seleccionar Registro:</label>
            <select
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              {relatedType === "lead" &&
                leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.lastName} - {l.company}
                  </option>
                ))}
              {relatedType === "opportunity" &&
                opportunities.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} ({o.companyName})
                  </option>
                ))}
              {relatedType === "company" &&
                companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-700 mb-1">Descripción / Objetivos</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Puntos a tocar, dudas del cliente a resolver, links de llamada..."
            className="w-full p-2.5 border border-slate-200 rounded-lg font-medium"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            {taskIdToEdit ? "Guardar Cambios" : "Programar Tarea"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
