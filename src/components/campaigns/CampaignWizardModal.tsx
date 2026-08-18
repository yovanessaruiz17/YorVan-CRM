import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { Send, Sparkles, CheckSquare, ShieldCheck, Mail } from "lucide-react";
import { analyzeSpamScore } from "../../services/emailDeliverabilityService";

interface CampaignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { templates = [], sequences = [], segments = [], addCampaign } = useCRM();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetType, setTargetType] = useState<"template" | "sequence">("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || "");
  const [selectedSequenceId, setSelectedSequenceId] = useState(sequences[0]?.id || "");
  const [selectedSegmentId, setSelectedSegmentId] = useState(segments[0]?.id || "");
  const [dailyLimit, setDailyLimit] = useState(50);
  const [sendSpeed, setSendSpeed] = useState<"natural" | "rapido">("natural");

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const spamReport = selectedTemplate ? analyzeSpamScore(selectedTemplate.subject, selectedTemplate.body) : null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCampaign({
      name,
      description,
      status: "borrador",
      templateId: targetType === "template" ? selectedTemplateId : undefined,
      sequenceId: targetType === "sequence" ? selectedSequenceId : undefined,
      segmentId: selectedSegmentId,
      dailyLimit: Number(dailyLimit),
      startDate: new Date().toISOString().slice(0, 10),
      createdByUserId: currentUser.id,
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        bounced: 0,
        openRate: 0,
        replyRate: 0,
      },
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asistente de Creación de Campaña"
      subtitle="Configura una nueva campaña de divulgación y prospección en frío"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Step Indicators */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "font-bold text-indigo-900" : "text-slate-500"}>
              General & Segmento
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "font-bold text-indigo-900" : "text-slate-500"}>
              Contenido / Plantilla
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 3 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "font-bold text-indigo-900" : "text-slate-500"}>
              Límites & Entregabilidad
            </span>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre de la Campaña *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Campaña Directores de IT - FinTech Q3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Descripción del Objetivo</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ofrecer auditoría de procesos B2B a decisores..."
                className="w-full p-2.5 border border-slate-200 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Audiencia Objetivo (Segmento)</label>
              <select
                value={selectedSegmentId}
                onChange={(e) => setSelectedSegmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
              >
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.description || "Segmento dinámico"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                Siguiente Paso →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-2">Estrategia de Envío:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType("template")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetType === "template"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="font-bold text-slate-900 block">Email Único (Plantilla)</span>
                  <span className="text-[11px] text-slate-500">Un solo correo individual a toda la lista</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("sequence")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetType === "sequence"
                      ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="font-bold text-slate-900 block">Secuencia Multietapa (Cadencia)</span>
                  <span className="text-[11px] text-slate-500">Cadencia con follow-ups automáticos</span>
                </button>
              </div>
            </div>

            {targetType === "template" ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Seleccionar Plantilla:</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>

                {spamReport && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Evaluación de Entregabilidad Spam:</span>
                      <p className="text-slate-500 text-[11px]">
                        Puntuación: {spamReport.spamScore}/100 ({spamReport.riskLevel})
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        spamReport.riskLevel === "bajo"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {spamReport.riskLevel.toUpperCase()} RIESGO
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Seleccionar Secuencia:</label>
                <select
                  value={selectedSequenceId}
                  onChange={(e) => setSelectedSequenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  {sequences.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.steps?.length || 0} pasos)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                ← Atrás
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                Siguiente Paso →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Límite de Envíos Diarios (Protección de Dominio)
                </label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  min={10}
                  max={500}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Recomendado: 40-70 emails/día para evitar alertas de spam.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cadencia / Intervalo</label>
                <select
                  value={sendSpeed}
                  onChange={(e) => setSendSpeed(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="natural">Espaciado Humano Natural (120-300 seg)</option>
                  <option value="rapido">Rápido (60 seg)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Protección Automática Anti-Spam Activa
              </span>
              <p className="text-[11px] text-emerald-800">
                Se respetará la lista de exclusión (Suppression List), calentamiento de IP y detección de bajas de suscripción automáticas.
              </p>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3.5 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                ← Atrás
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                Guardar y Programar Campaña 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
