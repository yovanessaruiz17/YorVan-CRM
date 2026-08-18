import React, { useState } from "react";
import {
  Contact2,
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Crown,
  ExternalLink,
  Edit2,
  Trash2,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { ContactDetailModal } from "./ContactDetailModal";
import { ContactFormModal } from "./ContactFormModal";

export const ContactsList: React.FC = () => {
  const { contacts = [], companies = [] } = useCRM();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterDecisionMaker, setFilterDecisionMaker] = useState("all");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const filteredContacts = (contacts || []).filter((c) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterCompany !== "all" && c.companyId !== filterCompany) {
      return false;
    }
    if (filterDecisionMaker === "yes" && !c.isDecisionMaker) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Contactos & Ejecutivos B2B
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agenda de tomadores de decisiones, directivos comerciales y puntos de contacto clave
          </p>
        </div>

        {hasPermission("contacts.create") && (
          <button
            onClick={() => {
              setEditingContactId(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contacto</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo, email o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todas las Empresas</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterDecisionMaker}
            onChange={(e) => setFilterDecisionMaker(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todos los Roles</option>
            <option value="yes">Solo Decisores (Decision Makers 👑)</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900">{filteredContacts.length}</strong> contactos
        </span>
      </div>

      {/* Contacts Table View */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Empresa</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Teléfono / WhatsApp</th>
                <th className="py-3.5 px-4">Rol de Decisión</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!filteredContacts.length ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron contactos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((ct) => (
                  <tr
                    key={ct.id}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    onClick={() => setSelectedContactId(ct.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center">
                          {ct.name[0]}
                          {ct.lastName?.[0] || ""}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {ct.name} {ct.lastName}
                          </p>
                          <span className="text-[11px] text-slate-500">{ct.jobTitle}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{ct.companyName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 font-medium">{ct.email}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 font-medium">
                        {ct.phone || ct.whatsapp || "No registrado"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {ct.isDecisionMaker ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Crown className="w-3 h-3 text-amber-600" />
                          Decisor
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Punto de enlace</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContactId(null);
                          setEditingContactId(ct.id);
                          setIsFormOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContactId && (
        <ContactDetailModal
          contactId={selectedContactId}
          onClose={() => setSelectedContactId(null)}
          onEdit={(id) => {
            setSelectedContactId(null);
            setEditingContactId(id);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <ContactFormModal
          isOpen={isFormOpen}
          contactIdToEdit={editingContactId}
          onClose={() => {
            setIsFormOpen(false);
            setEditingContactId(null);
          }}
        />
      )}
    </div>
  );
};
