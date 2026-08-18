import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CheckCircle2,
  Phone,
  Video,
  FileText,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { TaskModal } from "../tasks/TaskModal";

export const CommercialCalendar: React.FC = () => {
  const { tasks = [], toggleTaskStatus } = useCRM();
  const { currentUser } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex === 0 ? 6 : firstDayIndex - 1 }); // Monday start

  const formatDayString = (day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const dayTasks = tasks.filter((t) => t.dueDate === selectedDay);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Agenda Comercial & Calendario
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Planificación de demos, llamadas en frío, reuniones de cierre y citas comerciales
          </p>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Cita / Tarea</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid Box */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-1 uppercase">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {blankDays.map((_, i) => (
              <div key={`blank-${i}`} className="h-16 rounded-xl bg-slate-50/50" />
            ))}

            {daysArray.map((day) => {
              const dayStr = formatDayString(day);
              const isSelected = selectedDay === dayStr;
              const isToday = new Date().toISOString().slice(0, 10) === dayStr;
              const tasksOnDay = tasks.filter((t) => t.dueDate === dayStr);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(dayStr)}
                  className={`h-18 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40"
                      : isToday
                      ? "border-amber-400 bg-amber-50/30"
                      : "border-slate-100 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span
                    className={`text-xs font-bold inline-block w-5 h-5 text-center leading-5 rounded-full ${
                      isToday ? "bg-amber-500 text-white" : isSelected ? "bg-indigo-600 text-white" : "text-slate-700"
                    }`}
                  >
                    {day}
                  </span>

                  {tasksOnDay.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tasksOnDay.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="w-full text-[9px] font-bold truncate px-1 py-0.5 rounded bg-indigo-100 text-indigo-800"
                        >
                          {t.title}
                        </div>
                      ))}
                      {tasksOnDay.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-500">
                          +{tasksOnDay.length - 2} más
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Side Panel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5 space-y-4 flex flex-col">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Agenda del Día
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {!dayTasks.length ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No hay citas ni tareas programadas para este día.
              </div>
            ) : (
              dayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900">{t.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                      {t.type}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.dueTime || "Todo el día"}</span>
                    </div>
                    {t.companyName && (
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span>🏢 {t.companyName}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    className={`w-full py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      t.status === "completada"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.status === "completada" ? "Completada ✓" : "Marcar como realizada"}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}
    </div>
  );
};
