import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactIdToEdit?: string | null;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  contactIdToEdit,
}) => {
  const { contacts, companies, addContact, updateContact } = useCRM();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [department, setDepartment] = useState("Dirección General");
  const [isDecisionMaker, setIsDecisionMaker] = useState(false);

  useEffect(() => {
    if (contactIdToEdit) {
      const ct = contacts.find((c) => c.id === contactIdToEdit);
      if (ct) {
        setName(ct.name);
        setLastName(ct.lastName);
        setCompanyId(ct.companyId);
        setJobTitle(ct.jobTitle);
        setEmail(ct.email);
        setPhone(ct.phone || "");
        setWhatsapp(ct.whatsapp || "");
        setLinkedin(ct.linkedin || "");
        setDepartment(ct.department || "Dirección General");
        setIsDecisionMaker(ct.isDecisionMaker || false);
      }
    } else {
      setName("");
      setLastName("");
      setCompanyId(companies[0]?.id || "");
      setJobTitle("");
      setEmail("");
      setPhone("");
      setWhatsapp("");
      setLinkedin("");
      setDepartment("Dirección General");
      setIsDecisionMaker(false);
    }
  }, [contactIdToEdit, isOpen, contacts, companies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Por favor completa el nombre y el correo electrónico.");
      return;
    }

    const comp = companies.find((c) => c.id === companyId);

    if (contactIdToEdit) {
      updateContact(contactIdToEdit, {
        name,
        lastName,
        companyId,
        companyName: comp?.name || "Empresa B2B",
        jobTitle,
        email,
        phone,
        whatsapp,
        linkedin,
        department,
        isDecisionMaker,
      });
    } else {
      addContact({
        name,
        lastName,
        companyId: companyId || "comp-1",
        companyName: comp?.name || (companies[0]?.name ?? "Empresa B2B"),
        jobTitle,
        email,
        phone,
        whatsapp,
        linkedin,
        department,
        isDecisionMaker,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contactIdToEdit ? "Editar Contacto" : "Nuevo Contacto Ejecutivo"}
      subtitle="Registra a una persona clave dentro de una empresa cliente o prospecto"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mauricio"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ej. Cárdenas"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Empresa Perteneciente</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Cargo / Título</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ej. Vicepresidente Comercial"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejecutivo@empresa.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 310 000 0000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+57 310 000 0000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Perfil de LinkedIn</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/usuario"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Departamento / Área</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Ej. Operaciones, IT, Compras"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-3">
          <input
            type="checkbox"
            id="isDecisionMaker"
            checked={isDecisionMaker}
            onChange={(e) => setIsDecisionMaker(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded"
          />
          <label htmlFor="isDecisionMaker" className="font-bold text-amber-900 cursor-pointer">
            ¿Es Tomador de Decisiones (Decision Maker 👑)?
            <span className="block font-normal text-amber-700 text-[11px]">
              Marca si esta persona tiene poder de firma presupuestal en la compañía
            </span>
          </label>
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
            {contactIdToEdit ? "Guardar Cambios" : "Crear Contacto"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
