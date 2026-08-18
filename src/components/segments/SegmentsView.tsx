import React, { useState } from "react";
import {
  Filter,
  Plus,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Play,
  Send,
  Building2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { DynamicSegment, Lead } from "../../types/crm";
import { ScoreBadge, LeadStatusBadge } from "../common/Badge";

export const SegmentsView: React.FC = () => {
  const { segments = [], leads = [], addSegment, updateSegment, deleteSegment, users = [] } = useCRM();
  const { hasPermission } = useAuth();

  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(segments[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<DynamicSegment | null>(null);

  // Segment Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scoreLevelFilter, setScoreLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId) || segments[0];

  // Helper to filter leads by segment rules
  const getMatchedLeads = (seg?: DynamicSegment): Lead[] => {
    if (!seg) return [];
    return leads.filter((lead) => {
      // Dynamic evaluation based on segment criteria
      if (seg.criteria && seg.criteria.length > 0) {
        return seg.criteria.every((crit) => {
          const val = (lead as any)[crit.field];
          if (crit.operator === "equals") return String(val).toLowerCase() === String(crit.value).toLowerCase();
          if (crit.operator === "greater_than") return Number(val) > Number(crit.value);
          if (crit.operator === "contains") return String(val).toLowerCase().includes(String(crit.value).toLowerCase());
          if (crit.operator === "in") return Array.isArray(crit.value) && crit.value.includes(val);
          return true;
        });
      }

      // Default evaluation based on tags/name
      if (seg.name.toLowerCase().includes("calientes")) {
        return lead.scoreLevel === "muy_caliente" || lead.scoreLevel === "caliente" || lead.score >= 70;
      }
      if (seg.name.toLowerCase().includes("decisores") || seg.name.toLowerCase().includes("c-level")) {
        const title = (lead.jobTitle || "").toLowerCase();
        return title.includes("ceo") || title.includes("director") || title.includes("gerente") || title.includes("vp");
      }
      if (seg.name.toLowerCase().includes("fintech") || seg.name.toLowerCase().includes("tecnología")) {
        return (lead.industry || "").toLowerCase().includes("tech") || (lead.industry || "").toLowerCase().includes("software") || (lead.industry || "").toLowerCase().includes("fintech");
      }
      return true;
    });
  };

  const matchedLeads = getMatchedLeads(selectedSegment);

  const handleOpenCreate = () => {
    setEditingSegment(null);
    setName("");
    setDescription("");
    setScoreLevelFilter("all");
    setStatusFilter("all");
    setIndustryFilter("all");
    setCityFilter("all");
    setMinScoreFilter(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (seg: DynamicSegment) => {
    setEditingSegment(seg);
    setName(seg.name);
    setDescription(seg.description);
    setIsModalOpen(true);
  };

  const handleSaveSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const criteria = [];
    if (scoreLevelFilter !== "all") criteria.push({ field: "scoreLevel", operator: "equals" as const, value: scoreLevelFilter });
    if (statusFilter !== "all") criteria.push({ field: "status", operator: "equals" as const, value: statusFilter });
    if (industryFilter !== "all") criteria.push({ field: "industry", operator: "equals" as const, value: industryFilter });
    if (cityFilter !== "all") criteria.push({ field: "city", operator: "equals" as const, value: cityFilter });
    if (minScoreFilter > 0) criteria.push({ field: "score", operator: "greater_than" as const, value: minScoreFilter });

    if (editingSegment) {
      updateSegment(editingSegment.id, {
        name,
        description,
        conditions: criteria as any,
        criteria,
      });
    } else {
      const newSeg: DynamicSegment = {
        id: `seg-${Date.now()}`,
        name,
        description,
        conditions: criteria as any,
        criteria,
        leadsCount: 0,
        createdAt: new Date().toISOString(),
      };
      addSegment(newSeg);
      setSelectedSegmentId(newSeg.id);
    }

    setIsModalOpen(false);
  };

  const industries = Array.from(new Set(leads.map((l) => l.industry).filter(Boolean)));
  const cities = Array.from(new Set(leads.map((l) => l.city).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Segmentos Dinámicos</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Agrupación inteligente de prospectos según comportamiento, score y perfil de empresa.
              </p>
            </div>
          </div>
        </div>

        {hasPermission("leads.create") && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Segmento</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Segment list */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tus Segmentos ({segments.length})
              </h3>
            </div>

            <div className="space-y-2">
              {segments.map((seg) => {
                const isSelected = (selectedSegment?.id === seg.id);
                const count = getMatchedLeads(seg).length;

                return (
                  <div
                    key={seg.id}
                    onClick={() => setSelectedSegmentId(seg.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/40 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? "text-indigo-950" : "text-slate-800"}`}>
                          {seg.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {seg.description || "Segmento automatizado"}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                        {count} leads
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        Reglas automáticas
                      </span>
                      {hasPermission("leads.delete") && segments.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`¿Eliminar segmento "${seg.name}"?`)) {
                              deleteSegment(seg.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Matched Leads Details */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSegment ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Segment summary banner */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-bold text-indigo-200">
                      Segmento Activo
                    </span>
                    <span className="text-xs text-slate-300">
                      Actualización en tiempo real
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5">{selectedSegment.name}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">{selectedSegment.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 text-center">
                    <p className="text-xl font-black text-white">{matchedLeads.length}</p>
                    <p className="text-[10px] text-indigo-200 font-medium uppercase">Prospectos Cumplen</p>
                  </div>
                </div>
              </div>

              {/* Matched leads table */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Prospectos en este Segmento ({matchedLeads.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Auto-sincronizado con base de datos
                    </span>
                  </div>
                </div>

                {!matchedLeads.length ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No hay prospectos que cumplan este criterio aún</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Prueba ajustando los filtros o agregando nuevos prospectos al CRM.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Prospecto</th>
                          <th className="py-3 px-4">Empresa</th>
                          <th className="py-3 px-4">Cargo</th>
                          <th className="py-3 px-4">Calificación</th>
                          <th className="py-3 px-4">Score</th>
                          <th className="py-3 px-4">Asignado a</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchedLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {lead.name} {lead.lastName}
                              <span className="block text-[10px] font-normal text-slate-500">{lead.email}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-medium">{lead.company}</td>
                            <td className="py-3 px-4 text-slate-600">{lead.jobTitle}</td>
                            <td className="py-3 px-4">
                              <LeadStatusBadge status={lead.status} />
                            </td>
                            <td className="py-3 px-4">
                              <ScoreBadge score={lead.score} level={lead.scoreLevel} />
                            </td>
                            <td className="py-3 px-4 text-slate-600">{lead.assignedToName || "Sin asignar"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Create / Edit Segment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSegment ? "Editar Segmento Dinámico" : "Crear Nuevo Segmento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSegment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Segmento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Directores de Tecnología en Bogotá"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Objetivo</label>
                <input
                  type="text"
                  placeholder="Ej: Prospectos de alto valor para campaña outbound Q3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nivel de Temperatura</label>
                  <select
                    value={scoreLevelFilter}
                    onChange={(e) => setScoreLevelFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="all">Cualquier temperatura</option>
                    <option value="muy_caliente">Muy Caliente (Flame)</option>
                    <option value="caliente">Caliente (Hot)</option>
                    <option value="tibio">Tibio (Warm)</option>
                    <option value="frio">Frío (Cold)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado del Lead</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="all">Cualquier estado</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="contactado">Contactado</option>
                    <option value="respondio">Respondió</option>
                    <option value="calificado">Calificado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industria</label>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="all">Todas las industrias</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad</label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="all">Todas las ciudades</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {editingSegment ? "Guardar Cambios" : "Crear Segmento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
