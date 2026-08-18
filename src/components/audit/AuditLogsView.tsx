import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Clock,
  User,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { AuditLog } from "../../types/auth";
import { RoleBadge } from "../common/Badge";

export const AuditLogsView: React.FC = () => {
  const { auditLogs = [], users = [] } = useCRM();

  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (entityFilter !== "all" && log.entityType !== entityFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entityName.toLowerCase().includes(q) ||
        (log.oldValue && log.oldValue.toLowerCase().includes(q)) ||
        (log.newValue && log.newValue.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Fecha", "Usuario", "Rol", "Acción", "Entidad", "Nombre Entidad", "Valor Anterior", "Nuevo Valor", "IP"];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      l.userName,
      l.userRole,
      l.action,
      l.entityType,
      `"${l.entityName.replace(/"/g, '""')}"`,
      `"${(l.oldValue || "-").replace(/"/g, '""')}"`,
      `"${(l.newValue || "-").replace(/"/g, '""')}"`,
      l.ipAddress || "-",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yorvar_crm_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Registro de Auditoría (Audit Logs)</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Trazabilidad inmutable de cambios, accesos, creaciones y eliminaciones en el CRM.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Logs (CSV)</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o nombre de registro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">Todas las entidades</option>
            <option value="lead">Prospectos (Leads)</option>
            <option value="opportunity">Oportunidades (Pipeline)</option>
            <option value="company">Empresas</option>
            <option value="contact">Contactos</option>
            <option value="task">Tareas</option>
            <option value="campaign">Campañas</option>
            <option value="system">Sistema / Ajustes</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-4">Acción Realizada</th>
                <th className="py-3 px-4">Entidad Afectada</th>
                <th className="py-3 px-4">Detalle de Modificación</th>
                <th className="py-3 px-4 text-right">Dirección IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!filteredLogs.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">
                    No se encontraron registros de auditoría con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.userName}</span>
                        <RoleBadge role={log.userRole} />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="capitalize text-[11px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                          {log.entityType}
                        </span>
                        <span className="truncate max-w-[150px]">{log.entityName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {log.oldValue || log.newValue ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                          <span className="text-rose-600 bg-rose-50 px-1 rounded truncate max-w-[120px]">
                            {log.oldValue || "-"}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-bold truncate max-w-[120px]">
                            {log.newValue || "-"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                      {log.ipAddress || "186.84.90.12"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
