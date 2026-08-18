import React, { useState } from "react";
import {
  Users,
  Plus,
  UploadCloud,
  Download,
  Search,
  Filter,
  Flame,
  ArrowUpDown,
  Mail,
  Phone,
  Building2,
  Trash2,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { Lead, LeadScoreLevel, LeadStatus } from "../../types/crm";
import { ScoreBadge, LeadStatusBadge } from "../common/Badge";
import { exportToCSV } from "../../services/exportService";

interface LeadsListProps {
  onSelectLead: (leadId: string) => void;
  onOpenNewLeadModal: () => void;
  onOpenImportModal: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  onSelectLead,
  onOpenNewLeadModal,
  onOpenImportModal,
}) => {
  const { leads = [], deleteLead, users = [], convertLeadToOpportunity } = useCRM();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Filtering
  const filteredLeads = leads.filter((lead) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      lead.name.toLowerCase().includes(q) ||
      lead.lastName.toLowerCase().includes(q) ||
      lead.company.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.jobTitle.toLowerCase().includes(q) ||
      lead.city.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesScore = scoreFilter === "all" || lead.scoreLevel === scoreFilter;
    const matchesAssigned = assignedFilter === "all" || lead.assignedToUserId === assignedFilter;

    return matchesSearch && matchesStatus && matchesScore && matchesAssigned;
  });

  // Bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export to CSV
  const handleExport = () => {
    const dataToExport = filteredLeads.map((l) => ({
      ID: l.id,
      Nombre: `${l.name} ${l.lastName}`,
      Empresa: l.company,
      Cargo: l.jobTitle,
      Email: l.email,
      Teléfono: l.phone,
      WhatsApp: l.whatsapp || "",
      Ciudad: l.city,
      País: l.country,
      Fuente: l.source,
      Estado: l.status,
      Puntaje_Score: l.score,
      Nivel_Score: l.scoreLevel,
      Valor_Estimado: l.estimatedValue || 0,
      Responsable: l.assignedToName || "",
      Fecha_Creacion: l.createdAt,
    }));
    exportToCSV("YORVAR_CRM_Prospectos_Leads", dataToExport);
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Directorio de Prospectos (Leads)</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {filteredLeads.length} de {leads.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión comercial, scoring predictivo y seguimiento multicanal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {hasPermission("leads.import") && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Importar Asistido</span>
            </button>
          )}

          {hasPermission("leads.create") && (
            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Prospecto</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="all">Todos los Estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="en_prospeccion">En Prospección</option>
            <option value="contactado">Contactado</option>
            <option value="respondio">Respondió</option>
            <option value="calificado">Calificado</option>
            <option value="convertido">Convertido a Oportunidad</option>
            <option value="no_interesado">No Interesado</option>
          </select>
        </div>

        {/* Score Level */}
        <div>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="all">Todos los Niveles de Score</option>
            <option value="muy_caliente">🔥 Muy Caliente (121+ pts)</option>
            <option value="caliente">⚡ Caliente (71-120 pts)</option>
            <option value="tibio">💧 Tibio (31-70 pts)</option>
            <option value="frio">❄️ Frío (0-30 pts)</option>
          </select>
        </div>

        {/* Rep Filter */}
        <div>
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="all">Todos los Responsables</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.lastName} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk action toolbar if selected */}
      {selectedLeadIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl animate-in fade-in duration-100">
          <span className="text-xs font-bold text-indigo-900">
            {selectedLeadIds.length} prospectos seleccionados
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`¿Deseas eliminar los ${selectedLeadIds.length} prospectos seleccionados?`)) {
                  selectedLeadIds.forEach((id) => deleteLead(id));
                  setSelectedLeadIds([]);
                }
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Selección</span>
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3.5">Prospecto / Contacto</th>
                <th className="p-3.5">Empresa & Cargo</th>
                <th className="p-3.5">Lead Scoring</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Valor Estimado</th>
                <th className="p-3.5">Responsable</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!filteredLeads.length ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No se encontraron prospectos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead.id)}
                      className={`hover:bg-indigo-50/30 cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(lead.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Name & Contact */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600">
                          {lead.name} {lead.lastName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {lead.email}
                          </span>
                        </div>
                      </td>

                      {/* Company & Job */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.company}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{lead.jobTitle}</span>
                      </td>

                      {/* Score */}
                      <td className="p-3.5">
                        <ScoreBadge score={lead.score} level={lead.scoreLevel} />
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <LeadStatusBadge status={lead.status} />
                      </td>

                      {/* Estimated Value */}
                      <td className="p-3.5 font-bold text-slate-800">
                        {lead.estimatedValue
                          ? `$${(lead.estimatedValue / 1000000).toFixed(1)}M ${lead.currency || "COP"}`
                          : "-"}
                      </td>

                      {/* Rep */}
                      <td className="p-3.5">
                        <span className="font-medium text-slate-700">{lead.assignedToName || "Sin asignar"}</span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.status !== "convertido" && (
                            <button
                              onClick={() => convertLeadToOpportunity(lead.id)}
                              title="Convertir a Oportunidad en Pipeline"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold transition-colors"
                            >
                              Convertir
                            </button>
                          )}
                          <button
                            onClick={() => onSelectLead(lead.id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Ver ficha 360°"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
