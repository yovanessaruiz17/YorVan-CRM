import React, { useState } from "react";
import { LayoutDashboard, CheckSquare, Users, BarChart3 } from "lucide-react";
import { ExecutiveDashboard } from "./ExecutiveDashboard";
import { SalesDashboard } from "./SalesDashboard";
import { SDRDashboard } from "./SDRDashboard";
import { MarketingDashboard } from "./MarketingDashboard";
import { useAuth } from "../../context/AuthContext";

interface DashboardContainerProps {
  onNavigate: (section: any, entityId?: string) => void;
  onOpenAI: () => void;
  onSelectLead: (leadId: string) => void;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  onNavigate,
  onOpenAI,
  onSelectLead,
}) => {
  const { currentUser } = useAuth();

  // Pick initial view based on role
  const getDefaultTab = () => {
    if (currentUser.role === "vendedor") return "sales";
    if (currentUser.role === "sdr") return "sdr";
    if (currentUser.role === "marketing") return "marketing";
    return "executive";
  };

  const [activeTab, setActiveTab] = useState<"executive" | "sales" | "sdr" | "marketing">(getDefaultTab);

  const tabs = [
    { id: "executive", label: "Vista Ejecutiva & Pipeline", icon: LayoutDashboard },
    { id: "sales", label: "¿Qué hago hoy? (Ventas)", icon: CheckSquare },
    { id: "sdr", label: "Prospección Outbound (SDR)", icon: Users },
    { id: "marketing", label: "Entregabilidad & Email (Mkt)", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Dashboard interactivo sincronizado en tiempo real
        </div>
      </div>

      {/* Render selected dashboard view */}
      {activeTab === "executive" && (
        <ExecutiveDashboard onNavigate={onNavigate} onOpenAI={onOpenAI} />
      )}
      {activeTab === "sales" && (
        <SalesDashboard
          onNavigate={onNavigate}
          onOpenAI={onOpenAI}
          onSelectLead={onSelectLead}
        />
      )}
      {activeTab === "sdr" && (
        <SDRDashboard
          onNavigate={onNavigate}
          onOpenAI={onOpenAI}
          onSelectLead={onSelectLead}
        />
      )}
      {activeTab === "marketing" && (
        <MarketingDashboard onNavigate={onNavigate} onOpenAI={onOpenAI} />
      )}
    </div>
  );
};
