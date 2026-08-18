import React from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { BarChart3, Mail, CheckCircle, Eye, MousePointer, MessageSquare, AlertCircle } from "lucide-react";

interface CampaignStatsModalProps {
  campaignId: string | null;
  onClose: () => void;
}

export const CampaignStatsModal: React.FC<CampaignStatsModalProps> = ({
  campaignId,
  onClose,
}) => {
  const { campaigns } = useCRM();

  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;

  const stats = campaign.stats || {
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    bounced: 0,
    openRate: 0,
    replyRate: 0,
  };

  return (
    <Modal
      isOpen={!!campaignId}
      onClose={onClose}
      title={campaign.name}
      subtitle="Analítica en tiempo real de entregabilidad y conversión"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Top Funnel Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Enviados</span>
            <strong className="text-lg font-extrabold text-slate-900">{stats.sent}</strong>
          </div>

          <div className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-center">
            <span className="text-[10px] text-indigo-500 font-bold uppercase block">Tasa de Apertura</span>
            <strong className="text-lg font-extrabold text-indigo-700">{stats.openRate || 0}%</strong>
            <span className="text-[10px] text-slate-500 block">{stats.opened} leídos</span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[10px] text-emerald-500 font-bold uppercase block">Tasa de Respuesta</span>
            <strong className="text-lg font-extrabold text-emerald-700">{stats.replyRate || 0}%</strong>
            <span className="text-[10px] text-slate-500 block">{stats.replied} respuestas</span>
          </div>

          <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl text-center">
            <span className="text-[10px] text-rose-500 font-bold uppercase block">Rebotes (Bounces)</span>
            <strong className="text-lg font-extrabold text-rose-700">{stats.bounced || 0}</strong>
          </div>
        </div>

        {/* Funnel Progress Visual */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
          <h4 className="font-bold text-slate-900">Embudo de Rendimiento de Campaña</h4>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-700">Enviados & Entregados (100%)</span>
                <span className="text-slate-500">{stats.sent} emails</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-indigo-700">Aperturas ({stats.openRate || 0}%)</span>
                <span className="text-slate-500">{stats.opened} prospectos</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${stats.openRate || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-emerald-700">Respuestas Recibidas ({stats.replyRate || 0}%)</span>
                <span className="text-slate-500">{stats.replied} interesados</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(stats.replyRate || 0) * 2}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </Modal>
  );
};
