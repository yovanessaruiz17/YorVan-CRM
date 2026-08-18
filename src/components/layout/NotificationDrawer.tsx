import React from "react";
import { X, CheckCheck, Bell, Sparkles, CheckSquare, Send, Trophy, AlertTriangle } from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { NavSection } from "./Sidebar";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSection, entityId?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { notifications = [], markNotificationAsRead, markAllNotificationsAsRead } = useCRM();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "deal_won":
        return <Trophy className="w-4 h-4 text-emerald-600" />;
      case "task_due":
        return <CheckSquare className="w-4 h-4 text-amber-600" />;
      case "email_reply":
        return <Send className="w-4 h-4 text-blue-600" />;
      case "campaign_alert":
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Notificaciones</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              title="Marcar todas como leídas"
              className="p-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1 font-medium transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar leídas</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {!notifications.length ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No tienes notificaciones pendientes.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.link) {
                    onNavigate(notif.link as NavSection, notif.entityId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50"
                    : "bg-indigo-50/40 border-indigo-200 text-slate-900 shadow-xs hover:bg-indigo-50/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-2xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold truncate text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
