import React, { useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  Crown,
  Clock,
} from "lucide-react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";

interface ContactDetailModalProps {
  contactId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contactId,
  onClose,
  onEdit,
}) => {
  const { contacts, activities, addActivity, opportunities } = useCRM();
  const { currentUser } = useAuth();
  const [note, setNote] = useState("");

  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return null;

  const contactActivities = activities.filter((a) => a.leadName?.includes(contact.name));
  const contactOpps = opportunities.filter((o) => o.contactId === contact.id || o.companyId === contact.companyId);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    addActivity({
      type: "nota",
      title: `Nota sobre ${contact.name}`,
      description: note,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`,
      companyName: contact.companyName,
    });

    setNote("");
  };

  return (
    <Modal
      isOpen={!!contactId}
      onClose={onClose}
      title={`${contact.name} ${contact.lastName}`}
      subtitle={`${contact.jobTitle} en ${contact.companyName}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Info Banner */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {contact.name[0]}
              {contact.lastName?.[0] || ""}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {contact.name} {contact.lastName}
                </span>
                {contact.isDecisionMaker && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Decision Maker 👑
                  </span>
                )}
              </div>
              <span className="text-slate-500 font-medium">{contact.jobTitle}</span>
            </div>
          </div>

          <button
            onClick={() => onEdit(contact.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
            <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Vías de Contacto
            </h5>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-900">{contact.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Teléfono:</span>
              <span className="font-semibold text-slate-900">{contact.phone || "No especificado"}</span>
            </div>
            {contact.whatsapp && (
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp:</span>
                <span className="font-semibold text-emerald-700">{contact.whatsapp}</span>
              </div>
            )}
            {contact.linkedin && (
              <div className="flex justify-between">
                <span className="text-slate-500">LinkedIn:</span>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Ver Perfil <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
            <h5 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Empresa & Relación
            </h5>
            <div className="flex justify-between">
              <span className="text-slate-500">Empresa:</span>
              <span className="font-semibold text-slate-900">{contact.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Departamento:</span>
              <span className="font-semibold text-slate-900">{contact.department || "Comercial / Dirección"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Negocios Vinculados:</span>
              <span className="font-bold text-indigo-700">{contactOpps.length} negocios</span>
            </div>
          </div>
        </div>

        {/* Notes & Activity */}
        <div className="space-y-3">
          <h5 className="font-bold text-slate-800">Bitácora de Contacto</h5>
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              placeholder="Añadir comentario sobre este ejecutivo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg font-medium"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
            >
              Registrar
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
