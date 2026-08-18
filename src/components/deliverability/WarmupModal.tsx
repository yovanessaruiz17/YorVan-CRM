import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { Flame, ShieldCheck } from "lucide-react";

interface WarmupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WarmupModal: React.FC<WarmupModalProps> = ({ isOpen, onClose }) => {
  const { deliverabilityConfig, updateDeliverabilityConfig } = useCRM();
  const warmup = deliverabilityConfig?.warmup || {
    enabled: true,
    targetDaily: 40,
    rampUpRate: 3,
    replyRate: 30,
    currentDay: 14,
    dailySentToday: 28,
  };

  const [enabled, setEnabled] = useState(warmup.enabled);
  const [targetDaily, setTargetDaily] = useState(warmup.targetDaily);
  const [rampUpRate, setRampUpRate] = useState(warmup.rampUpRate);
  const [replyRate, setReplyRate] = useState(warmup.replyRate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeliverabilityConfig({
      warmup: {
        ...warmup,
        enabled,
        targetDaily: Number(targetDaily),
        rampUpRate: Number(rampUpRate),
        replyRate: Number(replyRate),
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Calentador de Bandejas (Email Warmup)"
      subtitle="Aumenta gradualmente la reputación de tu dominio ante Gmail y Outlook"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-bold text-amber-900 block">Estado del Calentamiento</span>
              <span className="text-[11px] text-amber-700">
                {enabled ? "Intercambiando emails seguros en la red peer-to-peer" : "Calentamiento inactivo"}
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Meta Diaria Final (Emails/día)</label>
            <input
              type="number"
              value={targetDaily}
              onChange={(e) => setTargetDaily(Number(e.target.value))}
              min={10}
              max={150}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Incremento Diario (Ramp-up)</label>
            <input
              type="number"
              value={rampUpRate}
              onChange={(e) => setRampUpRate(Number(e.target.value))}
              min={1}
              max={10}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Tasa de Respuesta Simulada ({replyRate}%)
          </label>
          <input
            type="range"
            min={10}
            max={50}
            value={replyRate}
            onChange={(e) => setReplyRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Una tasa de respuesta del 30% simula un comportamiento orgánico óptimo para Google/Microsoft.
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
            Guardar Configuración
          </button>
        </div>
      </form>
    </Modal>
  );
};
