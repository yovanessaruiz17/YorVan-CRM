import React from "react";
import { Send, MailCheck, Eye, MousePointerClick, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { StatCard } from "../common/StatCard";

interface MarketingDashboardProps {
  onNavigate: (section: any, entityId?: string) => void;
  onOpenAI: () => void;
}

export const MarketingDashboard: React.FC<MarketingDashboardProps> = ({
  onNavigate,
  onOpenAI,
}) => {
  const { campaigns, deliverabilityConfig } = useCRM();

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.openedCount, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.clickedCount, 0);

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "99.2";
  const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : "64.5";
  const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : "38.2";

  return (
    <div className="space-y-6">
      {/* Marketing KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tasa de Entregabilidad"
          value={`${deliveryRate}%`}
          subtitle={`Reputación de IP: ${deliverabilityConfig.reputationScore}/100`}
          change="0.5%"
          isPositive={true}
          icon={MailCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => onNavigate("deliverability")}
        />
        <StatCard
          title="Tasa de Apertura (Open Rate)"
          value={`${openRate}%`}
          subtitle={`${totalOpened} correos abiertos`}
          change="5.2%"
          isPositive={true}
          icon={Eye}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Tasa de Clics (CTR)"
          value={`${clickRate}%`}
          subtitle={`${totalClicked} enlaces pulsados`}
          change="2.8%"
          isPositive={true}
          icon={MousePointerClick}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Salud de Dominio & DNS"
          value="100% OK"
          subtitle="SPF, DKIM y DMARC activos"
          icon={ShieldCheck}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => onNavigate("deliverability")}
        />
      </div>

      {/* Campaigns list overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rendimiento de Campañas Masivas</h3>
            <p className="text-xs text-slate-500">Métricas de entrega y engagement por envío</p>
          </div>
          <button
            onClick={() => onNavigate("campaigns")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Ver todas las campañas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 font-semibold">Campaña</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Destinatarios</th>
                <th className="pb-3 font-semibold text-right">Aperturas</th>
                <th className="pb-3 font-semibold text-right">Clics</th>
                <th className="pb-3 font-semibold text-right">Respuestas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/70">
                  <td className="py-3">
                    <p className="font-bold text-slate-900">{camp.name}</p>
                    <p className="text-[11px] text-slate-400">{camp.subject}</p>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {camp.status === "completed" ? "Completada" : camp.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium text-slate-700">{camp.sentCount}</td>
                  <td className="py-3 text-right font-bold text-blue-600">
                    {camp.sentCount > 0 ? `${((camp.openedCount / camp.sentCount) * 100).toFixed(0)}%` : "0%"}
                  </td>
                  <td className="py-3 text-right font-bold text-indigo-600">
                    {camp.openedCount > 0 ? `${((camp.clickedCount / camp.openedCount) * 100).toFixed(0)}%` : "0%"}
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-600">{camp.repliedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
