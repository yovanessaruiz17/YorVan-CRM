import React, { useState, useEffect } from "react";
import { Search, Users, Building2, Contact2, KanbanSquare, CheckSquare, Send, ArrowRight, X } from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { NavSection } from "./Sidebar";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSection, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState("");
  const {
    leads = [],
    companies = [],
    contacts = [],
    opportunities = [],
    tasks = [],
    campaigns = [],
  } = useCRM();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedLeads = q
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.lastName.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedCompanies = q
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedOpportunities = q
    ? opportunities.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.companyName.toLowerCase().includes(q) ||
          o.productService.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.companyName && t.companyName.toLowerCase().includes(q))
      ).slice(0, 3)
    : [];

  const hasResults =
    matchedLeads.length > 0 ||
    matchedCompanies.length > 0 ||
    matchedOpportunities.length > 0 ||
    matchedTasks.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa, email, negocio o tarea..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Escribe el nombre de un contacto, empresa o negocio para buscar en todo el CRM.
            </div>
          )}

          {q && !hasResults && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No se encontraron coincidencias para <span className="font-bold">"{query}"</span>.
            </div>
          )}

          {/* Leads */}
          {matchedLeads.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Prospectos / Leads</span>
              </div>
              <div className="space-y-1">
                {matchedLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      onNavigate("leads", lead.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                        {lead.name} {lead.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {lead.company} · {lead.jobTitle} · {lead.city}
                      </p>
                    </div>
                    <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver lead <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Companies */}
          {matchedCompanies.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Empresas</span>
              </div>
              <div className="space-y-1">
                {matchedCompanies.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      onNavigate("companies", comp.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600">
                        {comp.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {comp.industry} · {comp.city} · {comp.contactsCount} contactos
                      </p>
                    </div>
                    <span className="text-xs text-purple-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver cuenta <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {matchedOpportunities.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <KanbanSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Oportunidades & Pipeline</span>
              </div>
              <div className="space-y-1">
                {matchedOpportunities.map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => {
                      onNavigate("pipeline", opp.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                        {opp.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ${opp.value.toLocaleString()} {opp.currency} · {opp.companyName}
                      </p>
                    </div>
                    <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver pipeline <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {matchedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Tareas</span>
              </div>
              <div className="space-y-1">
                {matchedTasks.map((tsk) => (
                  <button
                    key={tsk.id}
                    onClick={() => {
                      onNavigate("tasks", tsk.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600">
                        {tsk.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Vence: {tsk.dueDate} · Responsable: {tsk.assignedToName}
                      </p>
                    </div>
                    <span className="text-xs text-amber-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver tarea <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
