import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { Plus, Trash2, Mail, Phone, MessageSquare, Clock, ArrowDown } from "lucide-react";
import { SequenceStep, SequenceStepType } from "../../types/email";

interface SequenceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequenceIdToEdit?: string | null;
}

export const SequenceBuilderModal: React.FC<SequenceBuilderModalProps> = ({
  isOpen,
  onClose,
  sequenceIdToEdit,
}) => {
  const { sequences = [], addSequence, updateSequence, templates = [] } = useCRM();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<SequenceStep[]>([
    {
      id: "step-1",
      stepNumber: 1,
      type: "email",
      templateId: templates[0]?.id || "",
      delayDays: 0,
      subject: "Contacto Inicial",
      body: "Hola {{nombre}}, te escribo para...",
    },
    {
      id: "step-2",
      stepNumber: 2,
      type: "email",
      templateId: templates[1]?.id || "",
      delayDays: 3,
      subject: "Re: Seguimiento a nuestra propuesta",
      body: "Hola {{nombre}}, quería asegurarme de que recibiste mi mensaje anterior...",
    },
  ]);

  useEffect(() => {
    if (sequenceIdToEdit) {
      const seq = sequences.find((s) => s.id === sequenceIdToEdit);
      if (seq) {
        setName(seq.name);
        setDescription(seq.description || "");
        setSteps(seq.steps || []);
      }
    } else {
      setName("");
      setDescription("");
      setSteps([
        {
          id: "step-1",
          stepNumber: 1,
          type: "email",
          templateId: templates[0]?.id || "",
          delayDays: 0,
          subject: "Contacto Inicial",
          body: "Hola {{nombre}}, te escribo para...",
        },
      ]);
    }
  }, [sequenceIdToEdit, isOpen, sequences, templates]);

  const handleAddStep = () => {
    const newStepNum = steps.length + 1;
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      stepNumber: newStepNum,
      type: "email",
      delayDays: 3,
      subject: `Follow-up #${newStepNum}`,
      body: "Hola {{nombre}}, sigo a tu disposición...",
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, idx) => idx !== index);
    setSteps(updated.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  const handleStepChange = (index: number, field: keyof SequenceStep, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (sequenceIdToEdit) {
      updateSequence(sequenceIdToEdit, {
        name,
        description,
        steps,
      });
    } else {
      addSequence({
        name,
        description,
        status: "activa",
        steps,
        activeLeadsCount: 0,
        completedLeadsCount: 0,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sequenceIdToEdit ? "Editar Secuencia / Cadencia" : "Constructor de Secuencia Automatizada"}
      subtitle="Define los pasos, intervalos de días de espera y contenido de cada toque"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nombre de la Cadencia *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Cadencia Outbound C-Level (3 Toques)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Descripción del Objetivo</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Secuencia para agendar demo de 15 minutos con decisores..."
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Pasos de la Secuencia ({steps.length})</span>
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Paso</span>
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">
                      Paso {idx + 1}: {step.type.toUpperCase()}
                    </span>
                  </div>

                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Canal de Contacto</label>
                    <select
                      value={step.type}
                      onChange={(e) => handleStepChange(idx, "type", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                    >
                      <option value="email">✉️ Correo Electrónico</option>
                      <option value="llamada">📞 Tarea de Llamada</option>
                      <option value="linkedin">💼 Mensaje LinkedIn</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      {idx === 0 ? "Día Inicial" : "Días de espera tras el paso anterior"}
                    </label>
                    <input
                      type="number"
                      value={step.delayDays}
                      onChange={(e) => handleStepChange(idx, "delayDays", Number(e.target.value))}
                      min={0}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Plantilla Vinculada</label>
                    <select
                      value={step.templateId || ""}
                      onChange={(e) => {
                        const tId = e.target.value;
                        const tmpl = templates.find((t) => t.id === tId);
                        handleStepChange(idx, "templateId", tId);
                        if (tmpl) {
                          handleStepChange(idx, "subject", tmpl.subject);
                          handleStepChange(idx, "body", tmpl.body);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                    >
                      <option value="">Personalizado...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Asunto del Paso:</label>
                  <input
                    type="text"
                    value={step.subject || ""}
                    onChange={(e) => handleStepChange(idx, "subject", e.target.value)}
                    placeholder="Asunto..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Cuerpo / Script:</label>
                  <textarea
                    rows={3}
                    value={step.body || ""}
                    onChange={(e) => handleStepChange(idx, "body", e.target.value)}
                    placeholder="Mensaje..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-sans"
                  />
                </div>
              </div>
            ))}
          </div>
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
            {sequenceIdToEdit ? "Guardar Cambios" : "Crear Secuencia"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
