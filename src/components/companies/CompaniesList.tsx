import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Globe,
  Phone,
  Users,
  Briefcase,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { CompanyDetailModal } from "./CompanyDetailModal";
import { CompanyFormModal } from "./CompanyFormModal";
import { formatCurrencyCOP } from "../../data/initialConfig";

export const CompaniesList: React.FC = () => {
  const { companies = [], contacts = [], opportunities = [] } = useCRM();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  const industries = Array.from(new Set((companies || []).map((c) => c.industry).filter(Boolean)));

  const filteredCompanies = (companies || []).filter((comp) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        comp.name.toLowerCase().includes(q) ||
        comp.city?.toLowerCase().includes(q) ||
        comp.industry?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (industryFilter !== "all" && comp.industry !== industryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Empresas & Cuentas B2B
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Directorio corporativo, datos fiscales, historial de negocios e inteligencia de cuenta
          </p>
        </div>

        {hasPermission("companies.create") && (
          <button
            onClick={() => {
              setEditingCompanyId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Empresa</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de empresa o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todas las Industrias</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900">{filteredCompanies.length}</strong> empresas
        </span>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((comp) => {
          const compContacts = contacts.filter((c) => c.companyId === comp.id);
          const compOpps = opportunities.filter((o) => o.companyId === comp.id);
          const activeDealsValue = compOpps
            .filter((o) => o.stage !== "cierre_perdido")
            .reduce((acc, curr) => acc + curr.value, 0);

          return (
            <div
              key={comp.id}
              onClick={() => setSelectedCompanyId(comp.id)}
              className="p-4 bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl shadow-2xs hover:shadow-sm cursor-pointer transition-all space-y-3.5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {comp.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">{comp.industry}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {comp.city}, {comp.country}
                    </span>
                  </div>

                  {comp.website && (
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{comp.website}</span>
                    </div>
                  )}

                  {comp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{comp.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {compContacts.length} contactos
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {compOpps.length} negocios
                  </span>
                </div>

                {activeDealsValue > 0 && (
                  <span className="font-bold text-indigo-600 text-xs">
                    {formatCurrencyCOP(activeDealsValue)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedCompanyId && (
        <CompanyDetailModal
          companyId={selectedCompanyId}
          onClose={() => setSelectedCompanyId(null)}
          onEdit={(id) => {
            setSelectedCompanyId(null);
            setEditingCompanyId(id);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <CompanyFormModal
          isOpen={isFormOpen}
          companyIdToEdit={editingCompanyId}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCompanyId(null);
          }}
        />
      )}
    </div>
  );
};
