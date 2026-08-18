import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Users2,
  Filter,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { PriorityBadge } from "../common/Badge";
import { TaskModal } from "./TaskModal";

export const TasksList: React.FC = () => {
  const { tasks = [], toggleTaskStatus, deleteTask, users = [] } = useCRM();
  const { currentUser, hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pendiente" | "completada">("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.companyName?.toLowerCase().includes(q) ||
        t.leadName?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterStatus !== "all" && t.status !== filterStatus) {
      return false;
    }
    if (filterPriority !== "all" && t.priority !== filterPriority) {
      return false;
    }
    if (filterUser !== "all" && t.assignedToUserId !== filterUser) {
      return false;
    }
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === "pendiente").length;
  const completedCount = tasks.filter((t) => t.status === "completada").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tareas & Seguimiento Comercial
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Llamadas programadas, reuniones, envíos de propuestas y compromisos de venta
          </p>
        </div>

        {hasPermission("tasks.create") && (
          <button
            onClick={() => {
              setEditingTaskId(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        )}
      </div>

      {/* Metric summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-900 uppercase">
                Tareas Pendientes
              </span>
              <p className="text-lg font-extrabold text-amber-900">{pendingCount}</p>
            </div>
          </div>
          <span className="text-xs text-amber-700 font-medium">Por completar</span>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase">
                Tareas Completadas
              </span>
              <p className="text-lg font-extrabold text-emerald-900">{completedCount}</p>
            </div>
          </div>
          <span className="text-xs text-emerald-700 font-medium">Histórico ejecutado</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tareas, empresas o prospectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completada">Completadas</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="urgente">Urgente 🔥</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todos los Asignados</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {!filteredTasks.length ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-400">
            No se encontraron tareas con los filtros actuales.
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isCompleted = t.status === "completada";

            return (
              <div
                key={t.id}
                className={`p-3.5 bg-white border rounded-xl shadow-2xs transition-all flex items-center justify-between gap-4 ${
                  isCompleted
                    ? "border-slate-200/60 bg-slate-50/50 opacity-70"
                    : "border-slate-200/90 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    className="mt-0.5 shrink-0"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 hover:border-indigo-500 bg-white"
                      }`}
                    >
                      {isCompleted && <span className="text-xs">✓</span>}
                    </div>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs font-bold truncate ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {t.title}
                      </p>
                      <PriorityBadge priority={t.priority} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                      {t.companyName && (
                        <span className="font-semibold text-slate-700">🏢 {t.companyName}</span>
                      )}
                      {t.leadName && <span>👤 {t.leadName}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {t.dueDate} {t.dueTime || ""}
                      </span>
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
                        <User className="w-3 h-3" />
                        {t.assignedToName}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingTaskId(t.id);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          taskIdToEdit={editingTaskId}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTaskId(null);
          }}
        />
      )}
    </div>
  );
};
