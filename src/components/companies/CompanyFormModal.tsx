import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { Company } from "../../types/crm";

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyIdToEdit?: string | null;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  companyIdToEdit,
}) => {
  const { companies, addCompany, updateCompany } = useCRM();

  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [industry, setIndustry] = useState("Tecnología / Software B2B");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bogotá");
  const [country, setCountry] = useState("Colombia");
  const [size, setSize] = useState("11-50");

  useEffect(() => {
    if (companyIdToEdit) {
      const comp = companies.find((c) => c.id === companyIdToEdit);
      if (comp) {
        setName(comp.name);
        setTaxId(comp.taxId || "");
        setIndustry(comp.industry);
        setWebsite(comp.website || "");
        setPhone(comp.phone || "");
        setEmail(comp.email || "");
        setAddress(comp.address || "");
        setCity(comp.city);
        setCountry(comp.country);
        setSize(comp.size || "11-50");
      }
    } else {
      setName("");
      setTaxId("");
      setIndustry("Tecnología / Software B2B");
      setWebsite("");
      setPhone("");
      setEmail("");
      setAddress("");
      setCity("Bogotá");
      setCountry("Colombia");
      setSize("11-50");
    }
  }, [companyIdToEdit, isOpen, companies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor ingresa el nombre de la empresa.");
      return;
    }

    if (companyIdToEdit) {
      updateCompany(companyIdToEdit, {
        name,
        taxId,
        industry,
        website,
        phone,
        email,
        address,
        city,
        country,
        size,
      });
    } else {
      addCompany({
        name,
        taxId,
        industry,
        website,
        phone,
        email,
        address,
        city,
        country,
        size,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={companyIdToEdit ? "Editar Empresa" : "Nueva Cuenta Empresarial (B2B)"}
      subtitle="Datos corporativos y tributarios de la organización"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre de la Empresa *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Soluciones Logísticas Globales"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">NIT / Razón Social / Tax ID</label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="900.123.456-7"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Industria</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
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
            <label className="block font-bold text-slate-700 mb-1">Tamaño de la Empresa</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              <option value="1-10">1-10 empleados</option>
              <option value="11-50">11-50 empleados</option>
              <option value="51-200">51-200 empleados</option>
              <option value="201-500">201-500 empleados</option>
              <option value="500+">500+ empleados</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Sitio Web</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://empresa.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 601 000 0000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email General</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@empresa.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">País</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Dirección Principal</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Cra 7 # 71-21"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

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
            {companyIdToEdit ? "Guardar Cambios" : "Crear Empresa"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
