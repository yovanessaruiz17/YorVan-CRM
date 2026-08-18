import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { Sparkles, ShieldAlert, Check, Copy } from "lucide-react";
import { analyzeSpamScore } from "../../services/emailDeliverabilityService";
import { requestAIAssistant } from "../../services/geminiService";

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateIdToEdit?: string | null;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  templateIdToEdit,
}) => {
  const { templates, addTemplate, updateTemplate } = useCRM();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Prospección en Frío");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (templateIdToEdit) {
      const tmpl = templates.find((t) => t.id === templateIdToEdit);
      if (tmpl) {
        setName(tmpl.name);
        setCategory(tmpl.category);
        setSubject(tmpl.subject);
        setBody(tmpl.body);
      }
    } else {
      setName("");
      setCategory("Prospección en Frío");
      setSubject("");
      setBody("");
    }
  }, [templateIdToEdit, isOpen, templates]);

  const spam = analyzeSpamScore(subject, body);

  const insertVariable = (varName: string) => {
    setBody((prev) => prev + ` {{${varName}}}`);
  };

  const handleGenerateWithAI = async () => {
    setAiLoading(true);
    try {
      const res = await requestAIAssistant({
        type: "draft_email",
        leadData: {
          name: "Alejandro",
          lastName: "Ramírez",
          company: "Empresa Líder",
          jobTitle: "Director de Operaciones",
          industry: "Logística y Distribución",
        },
      });
      if (res.result) {
        setSubject(res.result.subject || subject);
        setBody(res.result.body || body);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const variables = Array.from(body.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1]);

    if (templateIdToEdit) {
      updateTemplate(templateIdToEdit, {
        name,
        category,
        subject,
        body,
        variables,
      });
    } else {
      addTemplate({
        name,
        category,
        subject,
        body,
        variables,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={templateIdToEdit ? "Editar Plantilla de Email" : "Nueva Plantilla de Email"}
      subtitle="Diseña copys persuasivos y libres de filtros antispam"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre Interno *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Introducción C-Level B2B"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              <option value="Prospección en Frío">Prospección en Frío</option>
              <option value="Seguimiento / Follow-up">Seguimiento / Follow-up</option>
              <option value="Post-Reunión / Demo">Post-Reunión / Demo</option>
              <option value="Propuesta Comercial">Propuesta Comercial</option>
              <option value="Reactivación / Nurturing">Reactivación / Nurturing</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Línea de Asunto (Subject) *</label>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={aiLoading}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? "Generando..." : "Optimizar con IA"}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ej. Pregunta rápida sobre {{empresa}}..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
          />
        </div>

        {/* Variables selector bar */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 block mb-1">Insertar Variable:</span>
          <div className="flex flex-wrap gap-1.5">
            {["nombre", "apellido", "empresa", "cargo", "vendedor", "ciudad", "industria"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono text-[10px] font-semibold transition-colors"
              >
                + &#123;&#123;{v}&#125;&#125;
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Cuerpo del Mensaje *</label>
          <textarea
            rows={7}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hola {{nombre}},&#10;&#10;Veo que lideras {{cargo}} en {{empresa}}..."
            className="w-full p-3 border border-slate-200 rounded-lg font-sans leading-relaxed text-xs"
          />
        </div>

        {/* Live Spam Score Warning Banner */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            spam.riskLevel === "bajo"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : spam.riskLevel === "medio"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div>
            <span className="font-bold">
              Diagnóstico Anti-Spam: {spam.spamScore}/100 ({spam.riskLevel.toUpperCase()} RIESGO)
            </span>
            {spam.spamWordsFound.length > 0 && (
              <p className="text-[11px] mt-0.5 opacity-90">
                Palabras de alerta detectadas: {spam.spamWordsFound.join(", ")}
              </p>
            )}
          </div>
          <span className="text-[11px] font-semibold">
            {spam.riskLevel === "bajo" ? "✅ Excelente entregabilidad" : "⚠️ Modifica las palabras marcadas"}
          </span>
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
            {templateIdToEdit ? "Guardar Cambios" : "Guardar Plantilla"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
