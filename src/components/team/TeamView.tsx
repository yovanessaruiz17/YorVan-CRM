import React, { useState } from "react";
import {
  UserCog,
  Plus,
  TrendingUp,
  Target,
  DollarSign,
  KanbanSquare,
  Users,
  Award,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { User, UserRole } from "../../types/auth";
import { RoleBadge } from "../common/Badge";
import { formatCurrencyCOP } from "../../data/initialConfig";

export const TeamView: React.FC = () => {
  const { users = [], opportunities = [], leads = [], companySettings } = useCRM();
  const { currentUser, switchUser, hasPermission } = useAuth();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newQuota, setNewQuota] = useState<number>(50000000);

  // Calculate stats for each user
  const getUserStats = (userId: string) => {
    const userDeals = (opportunities || []).filter((o) => o.assignedToUserId === userId);
    const wonDeals = userDeals.filter((o) => o.stage === "cierre_ganado" || o.stage === "ganada");
    const openDeals = userDeals.filter((o) => o.stage !== "cierre_ganado" && o.stage !== "cierre_perdido" && o.stage !== "perdida");
    const userLeads = (leads || []).filter((l) => l.assignedToUserId === userId);

    const closedRevenue = wonDeals.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const pipelineValue = openDeals.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const winRate = userDeals.length > 0 ? Math.round((wonDeals.length / userDeals.length) * 100) : 0;

    return {
      totalDeals: userDeals.length,
      openDealsCount: openDeals.length,
      wonDealsCount: wonDeals.length,
      closedRevenue,
      pipelineValue,
      leadsCount: userLeads.length,
      winRate,
    };
  };

  const currency = companySettings?.currency || "COP";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Equipo Comercial & Metas</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento de cuotas, cartera de clientes y desempeño individual por vendedor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span>Usuario Activo:</span>
          <span className="font-bold text-indigo-700">{currentUser.name} {currentUser.lastName}</span>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => {
          const stats = getUserStats(user.id);
          const quota = user.monthlyQuota || 50000000;
          const quotaPercent = Math.min(100, Math.round((stats.closedRevenue / quota) * 100));
          const isCurrentUser = currentUser.id === user.id;

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-xs flex flex-col justify-between ${
                isCurrentUser ? "border-indigo-400 ring-2 ring-indigo-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">
                        {user.name} {user.lastName}
                      </h3>
                    </div>
                    <div className="mt-1">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                </div>

                {isCurrentUser ? (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                    Tú
                  </span>
                ) : (
                  <button
                    onClick={() => switchUser(user.id)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 transition-colors"
                  >
                    Simular Rol
                  </button>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
              </div>

              {/* Quota Progress */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    Meta Mensual:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrencyCOP(quota)} {currency}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      quotaPercent >= 80 ? "bg-emerald-500" : quotaPercent >= 40 ? "bg-amber-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Cerrado: <strong className="text-slate-800">{formatCurrencyCOP(stats.closedRevenue)}</strong>
                  </span>
                  <span className="font-bold text-indigo-700">{quotaPercent}%</span>
                </div>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">Pipeline Activo</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{formatCurrencyCOP(stats.pipelineValue)}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">Leads Asignados</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{stats.leadsCount}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">Win Rate</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{stats.winRate}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
