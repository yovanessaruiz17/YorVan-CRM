import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  Briefcase,
  Edit2,
  Trash2,
  Calendar,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { formatCurrencyCOP } from "../../data/initialConfig";

interface CompanyDetailModalProps {
  companyId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  companyId,
  onClose,
  onEdit,
}) => {
  const { companies, contacts, opportunities, deleteCompany } = useCRM();
  const [activeTab, setActiveTab] = useState<"contacts" | "opportunities" | "info">("contacts");

  const company = companies.find((c) => c.id === companyId);
  if (!company) return null;

  const compContacts = contacts.filter((c) => c.companyId === company.id);
  const compOpps = opportunities.filter((o) => o.companyId === company.id);

  return (
    <Modal
      isOpen={!!companyId}
      onClose={onClose}
      title={company.name}
      subtitle={`${company.industry || "Industria B2B"} · ${company.city}, ${company.country}`}
      maxWidth="3xl"
    >
      {/* Header Info Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-5 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{company.name}</span>
            <span className="text-slate-500 font-medium">NIT / Tax ID: {company.taxId || "Sin registrar"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(company.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-5 pb-1">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "contacts" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Contactos ({compContacts.length})
        </button>
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "opportunities" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Oportunidades ({compOpps.length})
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "info" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Detalles Corporativos
        </button>
      </div>

      {/* Tab: Contacts */}
      {activeTab === "contacts" && (
        <div className="space-y-3">
          {!compContacts.length ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay contactos registrados asociados a esta empresa.
            </div>
          ) : (
            compContacts.map((ct) => (
              <div
                key={ct.id}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">
                    {ct.name} {ct.lastName}
                  </h4>
                  <span className="text-slate-500 font-medium">{ct.jobTitle}</span>
                  <div className="flex items-center gap-3 mt-1 text-slate-600 text-[11px]">
                    <span>📧 {ct.email}</span>
                    <span>📞 {ct.phone}</span>
                  </div>
                </div>

                {ct.isDecisionMaker && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Toma Decisiones 👑
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Opportunities */}
      {activeTab === "opportunities" && (
        <div className="space-y-3">
          {!compOpps.length ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay oportunidades de negocio abiertas con esta empresa.
            </div>
          ) : (
            compOpps.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{opp.title}</h4>
                  <span className="text-slate-500 font-medium">Etapa: {opp.stage}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-indigo-700 block">
                    {formatCurrencyCOP(opp.value)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Cierre: {opp.expectedCloseDate}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Info */}
      {activeTab === "info" && (
        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Dirección:</span>
              <span className="font-semibold text-slate-900">{company.address || "No especificada"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sitio Web:</span>
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-indigo-600 hover:underline"
              >
                {company.website || "No especificado"}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Teléfono Corporativo:</span>
              <span className="font-semibold text-slate-900">{company.phone || "No especificado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email Corporativo:</span>
              <span className="font-semibold text-slate-900">{company.email || "No especificado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tamaño / Empleados:</span>
              <span className="font-semibold text-slate-900">{company.size || "11-50"}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
