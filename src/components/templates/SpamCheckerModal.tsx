import React from "react";
import { Modal } from "../common/Modal";
import { EmailTemplate } from "../../types/email";
import { analyzeSpamScore } from "../../services/emailDeliverabilityService";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";

interface SpamCheckerModalProps {
  template: EmailTemplate;
  onClose: () => void;
}

export const SpamCheckerModal: React.FC<SpamCheckerModalProps> = ({
  template,
  onClose,
}) => {
  const analysis = analyzeSpamScore(template.subject, template.body);

  return (
    <Modal
      isOpen={!!template}
      onClose={onClose}
      title="Auditoría de Spam & Entregabilidad"
      subtitle={`Plantilla: ${template.name}`}
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Score Header */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            analysis.riskLevel === "bajo"
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : analysis.riskLevel === "medio"
              ? "bg-amber-50 border-amber-200 text-amber-950"
              : "bg-rose-50 border-rose-200 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-3">
            {analysis.riskLevel === "bajo" ? (
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                Nivel de Riesgo: {analysis.riskLevel.toUpperCase()}
              </h4>
              <p className="text-[11px] opacity-80">
                Puntaje de Spam: {analysis.spamScore} / 100
              </p>
            </div>
          </div>

          <span className="text-xl font-black">{100 - analysis.spamScore}% Salud</span>
        </div>

        {/* Spam keywords detected */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <h5 className="font-bold text-slate-800">Términos Detectados con Riesgo de Filtro Spam:</h5>
          {(!analysis?.spamWordsFound || !analysis.spamWordsFound.length) ? (
            <div className="flex items-center gap-2 text-emerald-700 font-semibold py-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No se detectaron términos desencadenantes de spam en el copy.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(analysis?.spamWordsFound || []).map((word) => (
                <span
                  key={word}
                  className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-[11px] font-bold border border-rose-200"
                >
                  "{word}"
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <h5 className="font-bold text-slate-800">Recomendaciones de Entregabilidad:</h5>
          <ul className="list-disc pl-4 space-y-1 text-slate-600">
            {(analysis?.recommendations || []).map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
          >
            Cerrar Auditoría
          </button>
        </div>
      </div>
    </Modal>
  );
};
