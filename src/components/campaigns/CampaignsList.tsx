import React, { useState } from "react";
import {
  Send,
  Plus,
  Search,
  Play,
  Pause,
  BarChart2,
  Mail,
  Users,
  CheckCircle,
  Eye,
  MousePointer,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { Campaign } from "../../types/email";
import { CampaignWizardModal } from "./CampaignWizardModal";
import { CampaignStatsModal } from "./CampaignStatsModal";

export const CampaignsList: React.FC = () => {
  const { campaigns = [], updateCampaignStatus, templates = [], segments = [] } = useCRM();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const filteredCampaigns = (campaigns || []).filter((c) => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterStatus !== "all" && c.status !== filterStatus) {
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
            Campañas de Cold Emailing & Outreach
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lanzamiento y control de campañas masivas de prospección en frío con control de spam
          </p>
        </div>

        {hasPermission("campaigns.create") && (
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Campaña</span>
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
              placeholder="Buscar campañas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todos los Estados</option>
            <option value="activa">Activas</option>
            <option value="pausada">Pausadas</option>
            <option value="borrador">Borradores</option>
            <option value="completada">Completadas</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900">{filteredCampaigns.length}</strong> campañas
        </span>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((camp) => {
          const stats = camp.stats || {
            sent: 0,
            opened: 0,
            clicked: 0,
            replied: 0,
            bounced: 0,
            openRate: 0,
            replyRate: 0,
          };

          return (
            <div
              key={camp.id}
              className="p-4 bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        camp.status === "activa"
                          ? "bg-emerald-100 text-emerald-800"
                          : camp.status === "pausada"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {camp.status}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 line-clamp-1">
                      {camp.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {camp.status === "activa" ? (
                      <button
                        onClick={() => updateCampaignStatus(camp.id, "pausada")}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Pausar Campaña"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateCampaignStatus(camp.id, "activa")}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Iniciar / Reanudar Campaña"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {camp.description || "Campaña de prospección B2B automatizada."}
                </p>

                {/* Metrics 4-grid */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Enviados</span>
                    <strong className="text-slate-900">{stats.sent}</strong>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Aperturas</span>
                    <strong className="text-indigo-600">{stats.openRate || 0}%</strong>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Respuestas</span>
                    <strong className="text-emerald-600">{stats.replyRate || 0}%</strong>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rebotes</span>
                    <strong className="text-rose-600">{stats.bounced || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Límite: {camp.dailyLimit || 50} emails/día
                </span>
                <button
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Ver Métricas</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wizard */}
      {isWizardOpen && (
        <CampaignWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
        />
      )}

      {/* Stats Modal */}
      {selectedCampaignId && (
        <CampaignStatsModal
          campaignId={selectedCampaignId}
          onClose={() => setSelectedCampaignId(null)}
        />
      )}
    </div>
  );
};
