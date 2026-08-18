import React from "react";
import { Users, PhoneCall, CalendarCheck, GitFork, Sparkles, Send, ArrowRight } from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { StatCard } from "../common/StatCard";
import { ScoreBadge, LeadStatusBadge } from "../common/Badge";

interface SDRDashboardProps {
  onNavigate: (section: any, entityId?: string) => void;
  onOpenAI: () => void;
  onSelectLead: (leadId: string) => void;
}

export const SDRDashboard: React.FC<SDRDashboardProps> = ({
  onNavigate,
  onOpenAI,
  onSelectLead,
}) => {
  const { leads, sequences } = useCRM();

  const newLeads = leads.filter((l) => l.status === "nuevo");
  const inProspecting = leads.filter((l) => l.status === "en_prospeccion");
  const respondedLeads = leads.filter((l) => l.status === "respondio");
  const qualifiedLeads = leads.filter((l) => l.status === "calificado" || l.status === "convertido");

  return (
    <div className="space-y-6">
      {/* SDR Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Nuevos Leads (Sin Tocar)"
          value={newLeads.length}
          subtitle="Requieren contacto inicial"
          icon={Users}
          iconBgColor="bg-cyan-50"
          iconColor="text-cyan-600"
          onClick={() => onNavigate("leads")}
        />
        <StatCard
          title="En Cadencia / Prospección"
          value={inProspecting.length}
          subtitle="Secuencias activas"
          icon={GitFork}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
          onClick={() => onNavigate("sequences")}
        />
        <StatCard
          title="Respuestas Recibidas"
          value={respondedLeads.length}
          subtitle="Tasa de respuesta: 24.8%"
          change="3.2%"
          isPositive={true}
          icon={PhoneCall}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          onClick={() => onNavigate("leads")}
        />
        <StatCard
          title="Reuniones Calificadas (SQL)"
          value={qualifiedLeads.length}
          subtitle="Pasadas a Account Executives"
          change="12.5%"
          isPositive={true}
          icon={CalendarCheck}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Cadence Overview & New Prospect Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Cadences / Sequences */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Secuencias Outbound Activas</h3>
            <button
              onClick={() => onNavigate("sequences")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Gestionar cadencias
            </button>
          </div>

          <div className="space-y-3">
            {sequences.map((seq) => (
              <div
                key={seq.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{seq.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      seq.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {seq.isActive ? "Activa" : "Pausada"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{seq.description}</p>
                <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-600 font-medium">
                  <span>{seq.steps.length} pasos multietapa</span>
                  <span>·</span>
                  <span>{seq.enrolledLeadsCount} inscritos</span>
                  <span>·</span>
                  <span className="text-emerald-600 font-bold">{seq.repliedCount} respuestas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uncontacted Leads Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Cola de Prospectos Nuevos</h3>
            <button
              onClick={() => onNavigate("leads")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Ver todos ({newLeads.length})
            </button>
          </div>

          <div className="space-y-2">
            {!newLeads.length ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay prospectos nuevos en cola.
              </div>
            ) : (
              newLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {lead.name} {lead.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {lead.company} · {lead.jobTitle}
                    </p>
                  </div>
                  <ScoreBadge score={lead.score} level={lead.scoreLevel} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
