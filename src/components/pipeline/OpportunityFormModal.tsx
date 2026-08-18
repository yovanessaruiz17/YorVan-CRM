import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { PipelineStageId } from "../../types/crm";

interface OpportunityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityIdToEdit?: string | null;
}

export const OpportunityFormModal: React.FC<OpportunityFormModalProps> = ({
  isOpen,
  onClose,
  opportunityIdToEdit,
}) => {
  const {
    opportunities = [],
    addOpportunity,
    updateOpportunity,
    pipelineStages = [],
    companies = [],
    contacts = [],
    companySettings,
    users = [],
  } = useCRM();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [value, setValue] = useState(25000000);
  const [stage, setStage] = useState<PipelineStageId>("contacto_inicial");
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [priority, setPriority] = useState<"baja" | "media" | "alta" | "urgente">("alta");
  const [assignedToUserId, setAssignedToUserId] = useState(currentUser.id);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (opportunityIdToEdit) {
      const opp = opportunities.find((o) => o.id === opportunityIdToEdit);
      if (opp) {
        setTitle(opp.title);
        setCompanyId(opp.companyId);
        setContactId(opp.contactId || "");
        setValue(opp.value);
        setStage(opp.stage);
        setExpectedCloseDate(opp.expectedCloseDate);
        setPriority(opp.priority);
        setAssignedToUserId(opp.assignedToUserId);
        setDescription(opp.description || "");
      }
    } else {
      setTitle("");
      setCompanyId(companies[0]?.id || "");
      setContactId(contacts[0]?.id || "");
      setValue(25000000);
      setStage("contacto_inicial");
      setExpectedCloseDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      );
      setPriority("alta");
      setAssignedToUserId(currentUser.id);
      setDescription("");
    }
  }, [opportunityIdToEdit, isOpen, opportunities, currentUser.id, companies, contacts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Por favor ingresa un título para la oportunidad.");
      return;
    }

    const comp = companies.find((c) => c.id === companyId);
    const cont = contacts.find((c) => c.id === contactId);
    const rep = users.find((u) => u.id === assignedToUserId);

    if (opportunityIdToEdit) {
      updateOpportunity(opportunityIdToEdit, {
        title,
        companyId,
        companyName: comp?.name || "Empresa B2B",
        contactId,
        contactName: cont ? `${cont.name} ${cont.lastName}` : "Contacto Principal",
        value: Number(value),
        stage,
        expectedCloseDate,
        priority,
        assignedToUserId,
        assignedToName: rep ? `${rep.name} ${rep.lastName}` : "Vendedor",
        description,
      });
    } else {
      addOpportunity({
        title,
        companyId: companyId || "comp-1",
        companyName: comp?.name || (companies[0]?.name ?? "Empresa B2B"),
        contactId,
        contactName: cont ? `${cont.name} ${cont.lastName}` : "Contacto Principal",
        value: Number(value),
        currency: companySettings.currency,
        stage,
        probability: pipelineStages.find((s) => s.id === stage)?.probability || 20,
        expectedCloseDate,
        priority,
        assignedToUserId,
        assignedToName: rep ? `${rep.name} ${rep.lastName}` : `${currentUser.name} ${currentUser.lastName}`,
        description,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunityIdToEdit ? "Editar Negocio / Oportunidad" : "Nueva Oportunidad Comercial"}
      subtitle="Define el alcance, importe y fechas estimadas de cierre"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nombre del Negocio / Proyecto *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Implementación Enterprise YORVAR CRM 50 Licencias"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Empresa / Cuenta</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contacto Principal</label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              {contacts.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name} {ct.lastName} ({ct.companyName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Valor del Negocio ({companySettings.currency}) *
            </label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Etapa Inicial</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              {pipelineStages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.probability}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cierre Estimado</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">Vendedor Asignado</label>
            <select
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.lastName} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Notas / Alcance</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles sobre las necesidades del cliente y alcance del servicio..."
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
            {opportunityIdToEdit ? "Guardar Cambios" : "Crear Oportunidad"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
