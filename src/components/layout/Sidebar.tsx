import React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Contact2,
  KanbanSquare,
  CheckSquare,
  Calendar,
  Send,
  GitFork,
  FileText,
  ShieldCheck,
  Filter,
  Zap,
  BarChart3,
  UserCog,
  History,
  Settings,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCRM } from "../../context/CRMContext";
import { RoleBadge } from "../common/Badge";

export type NavSection =
  | "dashboard"
  | "leads"
  | "companies"
  | "contacts"
  | "pipeline"
  | "tasks"
  | "calendar"
  | "campaigns"
  | "sequences"
  | "templates"
  | "deliverability"
  | "segments"
  | "automations"
  | "reports"
  | "team"
  | "audit"
  | "settings";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenAI: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  onOpenAI,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, hasPermission } = useAuth();
  const { leads = [], opportunities = [], tasks = [] } = useCRM();

  const hotLeadsCount = (leads || []).filter((l) => l.scoreLevel === "muy_caliente" || l.scoreLevel === "caliente").length;
  const pendingTasksCount = (tasks || []).filter((t) => t.status === "pendiente").length;
  const openDealsCount = (opportunities || []).filter((o) => o.stage !== "cierre_ganado" && o.stage !== "cierre_perdido").length;

  const navGroups = [
    {
      title: "PROSPECCIÓN & VENTAS",
      items: [
        {
          id: "dashboard" as NavSection,
          label: "Dashboard",
          icon: LayoutDashboard,
          allowed: true,
        },
        {
          id: "leads" as NavSection,
          label: "Prospectos (Leads)",
          icon: Users,
          badge: hotLeadsCount > 0 ? `${hotLeadsCount} hot` : undefined,
          badgeColor: "bg-rose-500 text-white",
          allowed: hasPermission("leads.view"),
        },
        {
          id: "pipeline" as NavSection,
          label: "Pipeline de Ventas",
          icon: KanbanSquare,
          badge: openDealsCount > 0 ? `${openDealsCount}` : undefined,
          badgeColor: "bg-indigo-500 text-white",
          allowed: hasPermission("opportunities.view"),
        },
        {
          id: "companies" as NavSection,
          label: "Empresas",
          icon: Building2,
          allowed: hasPermission("companies.view"),
        },
        {
          id: "contacts" as NavSection,
          label: "Contactos",
          icon: Contact2,
          allowed: hasPermission("contacts.view"),
        },
      ],
    },
    {
      title: "ACTIVIDAD & SEGUIMIENTO",
      items: [
        {
          id: "tasks" as NavSection,
          label: "Tareas & Seguimiento",
          icon: CheckSquare,
          badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : undefined,
          badgeColor: "bg-amber-500 text-white",
          allowed: hasPermission("tasks.view"),
        },
        {
          id: "calendar" as NavSection,
          label: "Agenda Comercial",
          icon: Calendar,
          allowed: true,
        },
      ],
    },
    {
      title: "EMAIL & AUTOMATIZACIÓN",
      items: [
        {
          id: "campaigns" as NavSection,
          label: "Campañas Masivas",
          icon: Send,
          allowed: hasPermission("campaigns.view"),
        },
        {
          id: "sequences" as NavSection,
          label: "Secuencias / Cadencias",
          icon: GitFork,
          allowed: hasPermission("campaigns.view"),
        },
        {
          id: "templates" as NavSection,
          label: "Plantillas de Email",
          icon: FileText,
          allowed: hasPermission("campaigns.view"),
        },
        {
          id: "deliverability" as NavSection,
          label: "Entregabilidad & DNS",
          icon: ShieldCheck,
          allowed: hasPermission("settings.view"),
        },
        {
          id: "segments" as NavSection,
          label: "Segmentos Dinámicos",
          icon: Filter,
          allowed: hasPermission("leads.view"),
        },
        {
          id: "automations" as NavSection,
          label: "Automatizaciones",
          icon: Zap,
          allowed: hasPermission("settings.view"),
        },
      ],
    },
    {
      title: "GESTIÓN & CONTROL",
      items: [
        {
          id: "reports" as NavSection,
          label: "Reportes & Analytics",
          icon: BarChart3,
          allowed: hasPermission("reports.view"),
        },
        {
          id: "team" as NavSection,
          label: "Equipo Comercial",
          icon: UserCog,
          allowed: hasPermission("users.view"),
        },
        {
          id: "audit" as NavSection,
          label: "Audit Logs",
          icon: History,
          allowed: hasPermission("settings.view"),
        },
        {
          id: "settings" as NavSection,
          label: "Configuración",
          icon: Settings,
          allowed: hasPermission("settings.view"),
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              Y
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base">YORVAR CRM</span>
              <span className="block text-[10px] text-indigo-400 font-medium tracking-wider uppercase -mt-0.5">
                Enterprise Commercial
              </span>
            </div>
          </div>
        </div>

        {/* AI Assistant Quick Banner */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              onOpenAI();
              if (isMobileOpen) onCloseMobile();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-indigo-950/80 border border-indigo-500/30 text-indigo-200 hover:border-indigo-400/60 transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-semibold text-white">AI Sales Copilot</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((i) => i.allowed);
            if (!visibleItems.length) return null;

            return (
              <div key={group.title}>
                <p className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectSection(item.id);
                          if (isMobileOpen) onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white font-semibold shadow-xs"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Footer Profile & Copyright */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-lg object-cover border border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentUser.name} {currentUser.lastName}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={currentUser.role} />
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <a
              href="https://yordevctg17.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-indigo-300 transition-colors font-medium hover:underline"
              title="Visitar sitio de Yordev"
            >
              <span>© Derechos Reservados Yordev</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
