import React, { useState } from "react";
import {
  GitFork,
  Plus,
  Search,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Play,
  Pause,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { SequenceBuilderModal } from "./SequenceBuilderModal";

export const SequencesList: React.FC = () => {
  const { sequences = [], deleteSequence } = useCRM();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingSequenceId, setEditingSequenceId] = useState<string | null>(null);

  const filteredSequences = (sequences || []).filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Secuencias & Cadencias Multietapa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatiza follow-ups en frío con retrasos temporales condicionales y pasos multicanal
          </p>
        </div>

        {hasPermission("campaigns.create") && (
          <button
            onClick={() => {
              setEditingSequenceId(null);
              setIsBuilderOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Secuencia</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar secuencias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900">{filteredSequences.length}</strong> secuencias
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSequences.map((seq) => (
          <div
            key={seq.id}
            className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{seq.name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {seq.steps.length} pasos programados
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSequenceId(seq.id);
                      setIsBuilderOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSequence(seq.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {seq.description && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {seq.description}
                </p>
              )}

              {/* Steps timeline preview */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Flujo de Pasos:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(seq.steps || []).map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 whitespace-nowrap flex items-center gap-1 shrink-0">
                        {step.type === "email" ? (
                          <Mail className="w-3 h-3 text-indigo-500" />
                        ) : step.type === "llamada" ? (
                          <Phone className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                        )}
                        <span>Paso {idx + 1}</span>
                      </div>
                      {idx < seq.steps.length - 1 && (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          +{seq.steps[idx + 1].delayDays}d →
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                👥 {seq.activeLeadsCount || 0} prospectos en curso
              </span>
              <span className="text-emerald-700 font-bold">
                {seq.completedLeadsCount || 0} completados
              </span>
            </div>
          </div>
        ))}
      </div>

      {isBuilderOpen && (
        <SequenceBuilderModal
          isOpen={isBuilderOpen}
          sequenceIdToEdit={editingSequenceId}
          onClose={() => {
            setIsBuilderOpen(false);
            setEditingSequenceId(null);
          }}
        />
      )}
    </div>
  );
};
