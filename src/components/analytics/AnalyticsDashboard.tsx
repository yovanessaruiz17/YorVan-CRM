import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Clock,
  ArrowUpRight,
  Flame,
  PieChart,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { formatCurrencyCOP } from "../../data/initialConfig";

export const AnalyticsDashboard: React.FC = () => {
  const { leads = [], opportunities = [], campaigns = [], users = [], pipelineStages = [] } = useCRM();

  const [timeframe, setTimeframe] = useState<"mes" | "trimestre" | "anio">("mes");

  // Calculations
  const totalPipelineValue = (opportunities || [])
    .filter((o) => o.stage !== "cierre_perdido" && o.stage !== "perdida")
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  const wonOpportunities = (opportunities || []).filter((o) => o.stage === "cierre_ganado" || o.stage === "ganada");
  const wonRevenue = wonOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const winRate =
    opportunities.length > 0
      ? Math.round((wonOpportunities.length / opportunities.length) * 100)
      : 0;

  const qualifiedLeads = (leads || []).filter((l) => ["calificado", "en_proceso"].includes(l.status));
  const leadQualificationRate =
    leads.length > 0 ? Math.round((qualifiedLeads.length / leads.length) * 100) : 0;

  // Stages distribution
  const stageCounts: Record<string, number> = {};
  (opportunities || []).forEach((o) => {
    stageCounts[o.stage] = (stageCounts[o.stage] || 0) + 1;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Analítica Comercial & Reportes Ejecutivos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rendimiento del pipeline, velocidad de ventas, conversión de prospección y forecast
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-bold">
          <button
            onClick={() => setTimeframe("mes")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === "mes" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setTimeframe("trimestre")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === "trimestre" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Trimestre (Q3)
          </button>
          <button
            onClick={() => setTimeframe("anio")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === "anio" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Año 2026
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pipeline Total Activo
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900">{formatCurrencyCOP(totalPipelineValue)}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs periodo anterior
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ingresos Cerrados (Ganados)
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-emerald-700">{formatCurrencyCOP(wonRevenue)}</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {wonOpportunities.length} negocios cerrados exitosamente
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Win Rate (Tasa de Cierre)
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900">{winRate}%</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +4.8% de efectividad comercial
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Calificación de Leads
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900">{leadQualificationRate}%</p>
          <span className="text-[11px] text-slate-500 font-medium">
            {qualifiedLeads.length} de {leads.length} leads calificados B2B
          </span>
        </div>
      </div>

      {/* Main Analysis Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pipeline Stage Breakdown */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            Distribución de Oportunidades por Etapa del Embudo
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { stage: "prospeccion", label: "Prospección Inicial", color: "bg-slate-500" },
              { stage: "calificacion", label: "Calificación & Discovery", color: "bg-blue-500" },
              { stage: "propuesta", label: "Propuesta / Cotización", color: "bg-indigo-500" },
              { stage: "negociacion", label: "Negociación & Contrato", color: "bg-purple-500" },
              { stage: "ganada", label: "Ganada (Cierre Exitoso)", color: "bg-emerald-500" },
              { stage: "perdida", label: "Perdida", color: "bg-rose-400" },
            ].map((st) => {
              const count = stageCounts[st.stage] || 0;
              const pct = opportunities.length > 0 ? (count / opportunities.length) * 100 : 0;

              return (
                <div key={st.stage} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                    <span>{st.label}</span>
                    <span>
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reps Performance Leaderboard */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            Tabla de Rendimiento de Ejecutivos Comerciales
          </h3>

          <div className="space-y-3">
            {users.map((u, idx) => {
              const userOpps = opportunities.filter((o) => o.assignedToUserId === u.id);
              const userWon = userOpps.filter((o) => o.stage === "ganada");
              const userRevenue = userWon.reduce((acc, curr) => acc + curr.value, 0);

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {u.name} {u.lastName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium capitalize">
                        {u.role.replace("_", " ")} · {userOpps.length} negocios gestionados
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-emerald-700 block">
                      {formatCurrencyCOP(userRevenue)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {userWon.length} cerrados
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
