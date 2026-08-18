import React, { useState } from "react";
import {
  ShieldCheck,
  Flame,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Zap,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { WarmupModal } from "./WarmupModal";
import { DnsConfigModal } from "./DnsConfigModal";

export const DeliverabilityCenter: React.FC = () => {
  const {
    deliverabilityConfig,
    updateDeliverabilityConfig,
    suppressionList = [],
    addToSuppressionList,
    removeFromSuppressionList,
  } = useCRM();
  const { hasPermission } = useAuth();

  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState(false);
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [newSuppressionEmail, setNewSuppressionEmail] = useState("");
  const [newSuppressionReason, setNewSuppressionReason] = useState<any>("desuscrito");

  const dns = deliverabilityConfig?.dnsStatus || { spf: true, dkim: true, dmarc: true, mx: true };
  const warmup = deliverabilityConfig?.warmup || { enabled: false, currentDay: 1, targetDailyVolume: 100, dailySentToday: 0 };

  const handleAddSuppression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppressionEmail.trim()) return;

    addToSuppressionList(newSuppressionEmail, newSuppressionReason);
    setNewSuppressionEmail("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Entregabilidad, Calentamiento & DNS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Salud de dominio (SPF, DKIM, DMARC, MX), calentador de bandejas y lista de exclusión
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDnsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Configurar DNS</span>
          </button>
          <button
            onClick={() => setIsWarmupModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Flame className="w-4 h-4" />
            <span>Ajustar Warmup</span>
          </button>
        </div>
      </div>

      {/* Top 3 Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Domain Health Card */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Salud del Dominio
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              98% Excelente
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                SPF (Sender Policy)
              </span>
              <span className="font-bold text-emerald-700">Válido</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                DKIM (Firma Criptográfica)
              </span>
              <span className="font-bold text-emerald-700">2048-bit</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                DMARC (Política estricta)
              </span>
              <span className="font-bold text-emerald-700">p=quarantine</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                MX Records
              </span>
              <span className="font-bold text-emerald-700">Google Workspace</span>
            </div>
          </div>
        </div>

        {/* Warmup Engine Card */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Motor de Calentamiento (Warmup)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                warmup.enabled ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-700"
              }`}
            >
              {warmup.enabled ? "Activo 🔥" : "Pausado"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Volumen Actual:</span>
              <span className="font-bold text-slate-900">{warmup.currentDaily} emails/día</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Meta Final:</span>
              <span className="font-bold text-slate-900">{warmup.targetDaily} emails/día</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tasa de Respuesta Simulada:</span>
              <span className="font-bold text-emerald-600">{warmup.replyRate}%</span>
            </div>

            <div className="pt-2">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (warmup.currentDaily / warmup.targetDaily) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Protection & Suppression Card */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Protección de Lista & Rebotes
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Blindaje Total
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total en Lista de Exclusión:</span>
              <strong className="text-slate-900">{suppressionList.length} correos</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Detección de Spam Words:</span>
              <strong className="text-emerald-700">Activada</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pausa Automática en Rebote Alto:</span>
              <strong className="text-emerald-700">Límite &gt; 3%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Suppression List Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Lista de Exclusión Global (Suppression List)
            </h3>
            <p className="text-xs text-slate-500">
              Correos a los que NUNCA se les enviarán campañas (bajas, quejas o rebotes duros)
            </p>
          </div>

          {/* Quick Add suppression form */}
          <form onSubmit={handleAddSuppression} className="flex items-center gap-2 text-xs">
            <input
              type="email"
              placeholder="bloquear@correo.com"
              value={newSuppressionEmail}
              onChange={(e) => setNewSuppressionEmail(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium"
            />
            <select
              value={newSuppressionReason}
              onChange={(e) => setNewSuppressionReason(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="desuscrito">Desuscrito</option>
              <option value="rebote_duro">Rebote Duro (Hard Bounce)</option>
              <option value="queja_spam">Queja de Spam</option>
              <option value="manual">Bloqueo Manual</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
            >
              Excluir
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-3">Email Excluido</th>
                <th className="py-2.5 px-3">Motivo de Bloqueo</th>
                <th className="py-2.5 px-3">Fecha de Inclusión</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!suppressionList.length ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No hay correos en la lista de exclusión.
                  </td>
                </tr>
              ) : (
                suppressionList.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{entry.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                        {entry.reason}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{entry.addedAt}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => removeFromSuppressionList(entry.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Desbloquear"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isWarmupModalOpen && (
        <WarmupModal
          isOpen={isWarmupModalOpen}
          onClose={() => setIsWarmupModalOpen(false)}
        />
      )}

      {isDnsModalOpen && (
        <DnsConfigModal
          isOpen={isDnsModalOpen}
          onClose={() => setIsDnsModalOpen(false)}
        />
      )}
    </div>
  );
};
