import React from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Trophy,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { StatCard } from "../common/StatCard";
import { ScoreBadge, LeadStatusBadge } from "../common/Badge";

interface ExecutiveDashboardProps {
  onNavigate: (section: any, entityId?: string) => void;
  onOpenAI: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onNavigate,
  onOpenAI,
}) => {
  const { leads = [], opportunities = [], companySettings, pipelineStages = [] } = useCRM();
  const currency = companySettings?.currency || "COP";

  // Metrics
  const totalPipelineValue = (opportunities || [])
    .filter((o) => o.stage !== "cierre_perdido")
    .reduce((sum, o) => sum + (o.value || 0), 0);

  const weightedPipelineValue = (opportunities || [])
    .filter((o) => o.stage !== "cierre_perdido")
    .reduce((sum, o) => sum + (o.weightedValue || 0), 0);

  const wonDeals = (opportunities || []).filter((o) => o.stage === "cierre_ganado");
  const totalWonRevenue = wonDeals.reduce((sum, o) => sum + (o.value || 0), 0);

  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === "convertido").length;
  const leadConversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

  const averageTicket = wonDeals.length > 0 ? totalWonRevenue / wonDeals.length : 35000000;

  // Pipeline distribution
  const stageStats = (pipelineStages || []).map((stage) => {
    const stageOpps = (opportunities || []).filter((o) => o.stage === stage.id);
    const count = stageOpps.length;
    const value = stageOpps.reduce((sum, o) => sum + (o.value || 0), 0);
    return {
      ...stage,
      count,
      value,
    };
  });

  // Leads by source
  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Executive Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-pipeline-total"
          title="Valor Total Pipeline"
          value={`$${(totalPipelineValue / 1000000).toFixed(1)}M ${currency}`}
          subtitle={`Ponderado: $${(weightedPipelineValue / 1000000).toFixed(1)}M`}
          change="18.4%"
          isPositive={true}
          icon={DollarSign}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
          onClick={() => onNavigate("pipeline")}
        />
        <StatCard
          id="stat-won-revenue"
          title="Ventas Cerradas (Mes)"
          value={`$${(totalWonRevenue / 1000000).toFixed(1)}M ${currency}`}
          subtitle={`${wonDeals.length} negocios ganados`}
          change="24.2%"
          isPositive={true}
          icon={Trophy}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => onNavigate("pipeline")}
        />
        <StatCard
          id="stat-conversion-rate"
          title="Tasa de Conversión"
          value={`${leadConversionRate}%`}
          subtitle={`${convertedLeads} de ${totalLeads} leads convertidos`}
          change="4.1%"
          isPositive={true}
          icon={Target}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          onClick={() => onNavigate("leads")}
        />
        <StatCard
          id="stat-avg-ticket"
          title="Ticket Promedio"
          value={`$${(averageTicket / 1000000).toFixed(1)}M ${companySettings.currency}`}
          subtitle="Por oportunidad ganada"
          change="7.5%"
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* AI Executive Insight Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-sm border border-indigo-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-600/40 border border-indigo-400/40 rounded-xl text-indigo-200 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Resumen Ejecutivo con IA
              </span>
              <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] rounded-full font-semibold">
                Salud Comercial Óptima
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
              El pipeline presenta una proyección de <strong>${(weightedPipelineValue / 1000000).toFixed(1)}M</strong> para el trimestre. Se detectan 3 oportunidades clave en etapa de <em>Negociación</em> que requieren seguimiento urgente para asegurar el cierre este mes.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAI}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generar Análisis Predictivo</span>
        </button>
      </div>

      {/* Two-Column Grid: Pipeline Funnel + Leads by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Embudo de Ventas por Etapa</h3>
              <p className="text-xs text-slate-500">Distribución de volumen y montos en curso</p>
            </div>
            <button
              onClick={() => onNavigate("pipeline")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Ver Kanban <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stageStats.map((stage) => {
              const maxStageVal = Math.max(...stageStats.map((s) => s.value), 1);
              const percentWidth = Math.max(8, Math.round((stage.value / maxStageVal) * 100));

              return (
                <div key={stage.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{stage.name}</span>
                      <span className="text-[11px] text-slate-400">({stage.probability}%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{stage.count} negocios</span>
                      <span className="font-bold text-slate-900">
                        ${(stage.value / 1000000).toFixed(1)}M {companySettings.currency}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentWidth}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Sources & Top Hot Deals (1 col) */}
        <div className="space-y-6">
          {/* Sources breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Fuentes de Prospección</h3>
            <p className="text-xs text-slate-500 mb-4">Origen de los prospectos activos</p>

            <div className="space-y-2.5">
              {Object.entries(sourceMap).map(([source, count]) => {
                const pct = ((count / totalLeads) * 100).toFixed(0);
                return (
                  <div key={source} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{pct}%</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold">
                        {count} leads
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Opportunities closing soon */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Negocios de Alto Valor</h3>
            <p className="text-xs text-slate-500 mb-3">Prioridad para cierre este mes</p>

            <div className="space-y-2">
              {opportunities
                .filter((o) => o.stage !== "cierre_ganado" && o.stage !== "cierre_perdido")
                .sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => onNavigate("pipeline", opp.id)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{opp.companyName}</p>
                      <span className="text-xs font-bold text-indigo-600">
                        ${(opp.value / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{opp.title}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
