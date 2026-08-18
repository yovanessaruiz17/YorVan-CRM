import React, { useState } from "react";
import {
  Building2,
  UserCheck,
  Mail,
  KanbanSquare,
  UploadCloud,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { companySettings, updateCompanySettings, deliverabilityConfig } = useCRM();
  const { currentUser } = useAuth();

  const steps = [
    {
      num: 1,
      title: "Configurar Empresa",
      icon: Building2,
      desc: "Define nombre, moneda, zona horaria e identificación tributaria.",
    },
    {
      num: 2,
      title: "Equipo y Roles",
      icon: UserCheck,
      desc: "Invita a tu equipo y asigna roles RBAC según sus responsabilidades comerciales.",
    },
    {
      num: 3,
      title: "Entregabilidad y Email",
      icon: Mail,
      desc: "Configura autenticación SPF, DKIM y DMARC para garantizar alta reputación.",
    },
    {
      num: 4,
      title: "Pipeline de Ventas",
      icon: KanbanSquare,
      desc: "Personaliza las 9 etapas de tu embudo y probabilidades de cierre.",
    },
    {
      num: 5,
      title: "Importación de Prospectos",
      icon: UploadCloud,
      desc: "Carga tu base de datos mediante el asistente en 7 pasos con detección de duplicados.",
    },
    {
      num: 6,
      title: "Primera Campaña o Secuencia",
      icon: Send,
      desc: "Lanza tu primera cadencia outbound automatizada con rate limiting seguro.",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guía de Configuración Inicial (Onboarding)"
      subtitle="Sigue estos 6 pasos estratégicos para poner en marcha tu CRM comercial"
      maxWidth="3xl"
    >
      {/* Steps Indicator */}
      <div className="grid grid-cols-6 gap-2 mb-8 pb-4 border-b border-slate-100">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                isCurrent
                  ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                  : isDone
                  ? "text-emerald-700 bg-emerald-50/50"
                  : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-xs font-bold ${
                  isCurrent
                    ? "bg-indigo-600 text-white"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              <span className="text-[10px] hidden sm:block truncate w-full">
                {step.title.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[260px]">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <Building2 className="w-8 h-8 text-indigo-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Paso 1: Datos de tu Organización</h4>
                <p className="text-xs text-slate-600">
                  Establece la identidad de tu empresa para presupuestos y variables dinámicas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={companySettings.name}
                  onChange={(e) => updateCompanySettings({ name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIT / Tax ID</label>
                <input
                  type="text"
                  value={companySettings.taxId}
                  onChange={(e) => updateCompanySettings({ taxId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Moneda Principal</label>
                <select
                  value={companySettings.currency}
                  onChange={(e) => updateCompanySettings({ currency: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
                >
                  <option value="COP">COP (Peso Colombiano)</option>
                  <option value="USD">USD (Dólar Estadounidense)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="MXN">MXN (Peso Mexicano)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Zona Horaria</label>
                <input
                  type="text"
                  value={companySettings.timezone}
                  disabled
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-purple-50/60 rounded-xl border border-purple-100">
              <UserCheck className="w-8 h-8 text-purple-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Paso 2: Usuarios & Roles (RBAC)</h4>
                <p className="text-xs text-slate-600">
                  Tu usuario actual es <strong className="text-slate-800">{currentUser.name} {currentUser.lastName}</strong> ({currentUser.role}).
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              YORVAR CRM incluye una matriz granular con 7 roles predefinidos (Super Admin, Admin Comercial, Gerente, Vendedor, SDR, Marketing y Soporte). Puedes cambiar entre ellos usando el simulador del menú superior.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              💡 Puedes gestionar usuarios y permisos individuales en la pestaña <strong>Equipo</strong> y en <strong>Configuración → Matriz RBAC</strong>.
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <Mail className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Paso 3: Autenticación de Dominio</h4>
                <p className="text-xs text-slate-600">
                  Dominio configurado: <strong className="text-slate-800">{deliverabilityConfig.domain}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {(deliverabilityConfig?.dnsRecords || []).map((rec) => (
                <div key={rec.type} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-800">{rec.type}</span>
                    <span className="font-mono text-slate-600 text-[11px] truncate max-w-xs">{rec.recordName}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {rec.status === "configured" ? "🟢 Verificado" : "🟡 Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-amber-50/60 rounded-xl border border-amber-100">
              <KanbanSquare className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Paso 4: Pipeline Comercial</h4>
                <p className="text-xs text-slate-600">
                  Embudo de 9 etapas con cálculo ponderado de probabilidades de cierre (Valor × Probabilidad).
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              Puedes arrastrar tarjetas en el tablero Kanban, registrar motivos de pérdida y activar celebraciones con confeti al cerrar negocios.
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-teal-50/60 rounded-xl border border-teal-100">
              <UploadCloud className="w-8 h-8 text-teal-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Paso 5: Importación Asistida en 7 Pasos</h4>
                <p className="text-xs text-slate-600">
                  Carga archivos CSV o Excel con mapeo de campos, validación de sintaxis y detección de duplicados.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
              <p>✓ <strong>Paso 1:</strong> Subir archivo CSV</p>
              <p>✓ <strong>Paso 2:</strong> Detección automática de columnas</p>
              <p>✓ <strong>Paso 3:</strong> Mapeo interactivo a campos del CRM</p>
              <p>✓ <strong>Paso 4:</strong> Validación y filtros de supresión</p>
              <p>✓ <strong>Paso 5:</strong> Detección de duplicados por email/teléfono</p>
              <p>✓ <strong>Paso 6:</strong> Vista previa y confirmación</p>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <Send className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Paso 6: ¡Listo para Vender!</h4>
                <p className="text-xs text-slate-600">
                  Tu sistema CRM comercial y de automatización está 100% operativo.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Explora las secuencias multietapa, el asistente de IA para redacción y el centro de entregabilidad.
            </p>

            <button
              onClick={() => {
                onClose();
                onNavigate("dashboard");
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Ir al Dashboard Comercial
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </button>

        {currentStep < 6 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Siguiente Paso
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Finalizar Onboarding
          </button>
        )}
      </div>
    </Modal>
  );
};
