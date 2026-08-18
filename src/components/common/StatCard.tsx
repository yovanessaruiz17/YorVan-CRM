import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600",
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium truncate">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-semibold ${
                  isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isPositive ? "↑ " : "↓ "}
                {change}
              </span>
              <span className="text-xs text-slate-400">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor} shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};
