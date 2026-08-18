import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { Lead, LeadStatus } from "../../types/crm";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadIdToEdit?: string | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  leadIdToEdit,
}) => {
  const { leads = [], addLead, updateLead, companySettings, users = [] } = useCRM();
  const { currentUser } = useAuth();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("Bogotá");
  const [country, setCountry] = useState("Colombia");
  const [industry, setIndustry] = useState("Tecnología / Software B2B");
  const [companySize, setCompanySize] = useState("11-50");
  const [website, setWebsite] = useState("");
  const [source, setSource] = useState("Inbound Web");
  const [status, setStatus] = useState<LeadStatus>("nuevo");
  const [estimatedValue, setEstimatedValue] = useState<number>(30000000);
  const [assignedToUserId, setAssignedToUserId] = useState<string>(currentUser.id);
  const [tagsInput, setTagsInput] = useState("B2B, Prospecto");

  useEffect(() => {
    if (leadIdToEdit) {
      const existing = leads.find((l) => l.id === leadIdToEdit);
      if (existing) {
        setName(existing.name);
        setLastName(existing.lastName);
        setCompany(existing.company);
        setJobTitle(existing.jobTitle);
        setEmail(existing.email);
        setPhone(existing.phone);
        setWhatsapp(existing.whatsapp || "");
        setCity(existing.city);
        setCountry(existing.country);
        setIndustry(existing.industry || "Tecnología / Software B2B");
        setCompanySize(existing.companySize || "11-50");
        setWebsite(existing.website || "");
        setSource(existing.source);
        setStatus(existing.status);
        setEstimatedValue(existing.estimatedValue || 30000000);
        setAssignedToUserId(existing.assignedToUserId || currentUser.id);
        setTagsInput(existing.tags?.join(", ") || "");
      }
    } else {
      // Reset form
      setName("");
      setLastName("");
      setCompany("");
      setJobTitle("");
      setEmail("");
      setPhone("");
      setWhatsapp("");
      setCity("Bogotá");
      setCountry("Colombia");
      setIndustry("Tecnología / Software B2B");
      setCompanySize("11-50");
      setWebsite("");
      setSource("Inbound Web");
      setStatus("nuevo");
      setEstimatedValue(30000000);
      setAssignedToUserId(currentUser.id);
      setTagsInput("B2B, Prospecto");
    }
  }, [leadIdToEdit, isOpen, leads, currentUser.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) {
      alert("Por favor completa los campos obligatorios (Nombre, Empresa, Email).");
      return;
    }

    const assignedUser = users.find((u) => u.id === assignedToUserId);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (leadIdToEdit) {
      updateLead(leadIdToEdit, {
        name,
        lastName,
        company,
        jobTitle,
        email,
        phone,
        whatsapp,
        city,
        country,
        industry,
        companySize,
        website,
        source,
        status,
        estimatedValue: Number(estimatedValue),
        assignedToUserId,
        assignedToName: assignedUser ? `${assignedUser.name} ${assignedUser.lastName}` : "Sin asignar",
        tags,
      });
    } else {
      addLead({
        name,
        lastName,
        company,
        jobTitle,
        email,
        phone,
        whatsapp,
        city,
        country,
        industry,
        companySize,
        website,
        source,
        status,
        estimatedValue: Number(estimatedValue),
        currency: companySettings.currency,
        assignedToUserId,
        assignedToName: assignedUser ? `${assignedUser.name} ${assignedUser.lastName}` : "Sin asignar",
        tags,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={leadIdToEdit ? "Editar Prospecto" : "Nuevo Prospecto (Lead)"}
      subtitle="Ingresa la información comercial para prospección y scoring automático"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej. Gómez"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Company & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Empresa *</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ej. Logística Global S.A.S"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cargo / Posición</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ej. Director Comercial"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@empresa.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 310 000 0000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+57 310 000 0000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Geography & Industry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Industria</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            >
              <option value="Tecnología / Software B2B">Tecnología / Software B2B</option>
              <option value="Financiero / FinTech">Financiero / FinTech</option>
              <option value="Logística y Transporte">Logística y Transporte</option>
              <option value="Salud / Farmacéutico">Salud / Farmacéutico</option>
              <option value="Manufactura / Industrial">Manufactura / Industrial</option>
              <option value="Servicios Profesionales">Servicios Profesionales</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tamaño Empresa</label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            >
              <option value="1-10">1-10 empleados</option>
              <option value="11-50">11-50 empleados</option>
              <option value="51-200">51-200 empleados</option>
              <option value="201-500">201-500 empleados</option>
              <option value="500+">500+ empleados</option>
            </select>
          </div>
        </div>

        {/* Commercial Pipeline Data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Fuente del Lead</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            >
              <option value="Inbound Web">Inbound Web / Formulario</option>
              <option value="Outbound Email">Outbound Email / Campaña</option>
              <option value="LinkedIn Outbound">LinkedIn Outbound</option>
              <option value="Referido">Referido Comercial</option>
              <option value="Evento / Conferencia">Evento / Conferencia</option>
              <option value="Llamada en Frío">Llamada en Frío</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            >
              <option value="nuevo">Nuevo</option>
              <option value="en_prospeccion">En Prospección</option>
              <option value="contactado">Contactado</option>
              <option value="respondio">Respondió</option>
              <option value="calificado">Calificado</option>
              <option value="no_interesado">No Interesado</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Valor Estimado ({companySettings.currency})</label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Assigned Rep & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Responsable Comercial</label>
            <select
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.lastName} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Etiquetas (Separadas por comas)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="B2B, SaaS, Prioridad Alta"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            {leadIdToEdit ? "Guardar Cambios" : "Crear Prospecto"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
