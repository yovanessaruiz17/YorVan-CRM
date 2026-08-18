import React, { useState } from "react";
import {
  Plus,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  User,
  MoreVertical,
  Trophy,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { Opportunity, PipelineStageId } from "../../types/crm";
import { OpportunityDetailModal } from "./OpportunityDetailModal";
import { OpportunityFormModal } from "./OpportunityFormModal";
import { formatCurrencyCOP } from "../../data/initialConfig";

export const PipelineKanban: React.FC = () => {
  const {
    opportunities = [],
    pipelineStages = [],
    updateOpportunityStage,
    companySettings,
    users = [],
  } = useCRM();
  const { currentUser, hasPermission } = useAuth();

  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [filterMinVal, setFilterMinVal] = useState<string>("");

  // Drag and Drop state
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStageId | null>(null);

  // Close Won/Lost Modal state
  const [closingDeal, setClosingDeal] = useState<{
    id: string;
    stage: "cierre_ganado" | "cierre_perdido";
  } | null>(null);
  const [closeNotes, setCloseNotes] = useState("");
  const [lostReason, setLostReason] = useState("Precio muy elevado");

  const filteredOpportunities = opportunities.filter((opp) => {
    if (searchTerm) {
      const match =
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.contactName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    if (filterUser !== "all" && opp.assignedToUserId !== filterUser) {
      return false;
    }
    if (filterMinVal && opp.value < Number(filterMinVal)) {
      return false;
    }
    return true;
  });

  const totalPipelineValue = filteredOpportunities
    .filter((o) => o.stage !== "cierre_ganado" && o.stage !== "cierre_perdido")
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalWeightedValue = filteredOpportunities
    .filter((o) => o.stage !== "cierre_ganado" && o.stage !== "cierre_perdido")
    .reduce((acc, curr) => acc + curr.weightedValue, 0);

  const wonValue = filteredOpportunities
    .filter((o) => o.stage === "cierre_ganado")
    .reduce((acc, curr) => acc + curr.value, 0);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    e.dataTransfer.setData("text/plain", oppId);
    setDraggedOppId(oppId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: PipelineStageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: PipelineStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const oppId = e.dataTransfer.getData("text/plain") || draggedOppId;
    if (!oppId) return;

    if (stageId === "cierre_ganado" || stageId === "cierre_perdido") {
      setClosingDeal({ id: oppId, stage: stageId });
    } else {
      updateOpportunityStage(oppId, stageId);
    }
    setDraggedOppId(null);
  };

  const handleConfirmCloseDeal = () => {
    if (!closingDeal) return;
    updateOpportunityStage(
      closingDeal.id,
      closingDeal.stage,
      closingDeal.stage === "cierre_ganado" ? closeNotes : undefined,
      closingDeal.stage === "cierre_perdido" ? lostReason : undefined
    );
    setClosingDeal(null);
    setCloseNotes("");
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pipeline de Ventas (Kanban)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestiona visualmente el flujo comercial, probabilidades ponderadas y etapas de cierre
          </p>
        </div>

        {hasPermission("opportunities.create") && (
          <button
            onClick={() => {
              setEditingOppId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Oportunidad</span>
          </button>
        )}
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total en Pipeline Abierto
            </span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">
              {formatCurrencyCOP(totalPipelineValue)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Forecast Ponderado (Ponderación %)
            </span>
            <p className="text-base font-extrabold text-indigo-700 mt-0.5">
              {formatCurrencyCOP(totalWeightedValue)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ventas Cerradas Ganadas
            </span>
            <p className="text-base font-extrabold text-emerald-700 mt-0.5">
              {formatCurrencyCOP(wonValue)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por negocio, empresa o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todos los Vendedores</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong className="text-slate-900">{filteredOpportunities.length}</strong> oportunidades
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[1300px] items-start">
          {pipelineStages.map((stage) => {
            const stageOpps = filteredOpportunities.filter((o) => o.stage === stage.id);
            const stageSum = stageOpps.reduce((acc, curr) => acc + curr.value, 0);
            const isHovered = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex-1 min-w-[260px] max-w-[300px] bg-slate-50/80 rounded-2xl border transition-all flex flex-col max-h-[calc(100vh-280px)] ${
                  isHovered
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30"
                    : "border-slate-200/90"
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/70 bg-white/70 rounded-t-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-bold text-xs text-slate-900 truncate">
                        {stage.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200/70 text-slate-700">
                      {stageOpps.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{stage.probability}% prob.</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrencyCOP(stageSum)}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
                  {!stageOpps.length ? (
                    <div className="text-center py-8 px-2 border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                      Arrastra oportunidades aquí
                    </div>
                  ) : (
                    stageOpps.map((opp) => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp.id)}
                        onClick={() => setSelectedOppId(opp.id)}
                        className="p-3.5 bg-white border border-slate-200/90 hover:border-indigo-300 rounded-xl shadow-2xs hover:shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {opp.title}
                          </h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                              opp.priority === "urgente"
                                ? "bg-rose-100 text-rose-800"
                                : opp.priority === "alta"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {opp.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{opp.companyName}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="font-extrabold text-slate-900">
                            {formatCurrencyCOP(opp.value)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {opp.expectedCloseDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <div className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{opp.assignedToName}</span>
                          </div>
                          {opp.score && (
                            <span className="font-bold text-indigo-600">
                              Score: {opp.score}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOppId && (
        <OpportunityDetailModal
          opportunityId={selectedOppId}
          onClose={() => setSelectedOppId(null)}
          onEdit={(id) => {
            setSelectedOppId(null);
            setEditingOppId(id);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Opportunity Create / Edit Modal */}
      {isFormOpen && (
        <OpportunityFormModal
          isOpen={isFormOpen}
          opportunityIdToEdit={editingOppId}
          onClose={() => {
            setIsFormOpen(false);
            setEditingOppId(null);
          }}
        />
      )}

      {/* Close Won / Lost Modal */}
      {closingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  closingDeal.stage === "cierre_ganado"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {closingDeal.stage === "cierre_ganado" ? (
                  <Trophy className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {closingDeal.stage === "cierre_ganado"
                    ? "¡Felicidades! Cierre Ganado 🎉"
                    : "Marcar Oportunidad como Perdida"}
                </h3>
                <p className="text-xs text-slate-500">
                  Registra los detalles del resultado para alimentar los reportes
                </p>
              </div>
            </div>

            {closingDeal.stage === "cierre_ganado" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas del éxito o valor contratado:
                </label>
                <textarea
                  rows={3}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Ej. Contrato firmado por 12 meses. Inicio de implementación el próximo lunes."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 font-medium"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo principal de pérdida:
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-500 font-medium bg-white"
                >
                  <option value="Precio muy elevado">Precio muy elevado / Falta de presupuesto</option>
                  <option value="Eligieron a la competencia">Eligieron a la competencia</option>
                  <option value="Proyecto congelado / Sin prioridad">Proyecto congelado o aplazado</option>
                  <option value="Falta de funciones clave">Falta de características técnicas</option>
                  <option value="No hubo respuesta / Ghosting">No hubo respuesta tras cotización</option>
                  <option value="Decisión interna cancelada">Decisión interna cancelada</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setClosingDeal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseDeal}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-colors ${
                  closingDeal.stage === "cierre_ganado"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Guardar Resultado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
