import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  ShieldCheck,
  Edit2,
  Trash2,
  Copy,
  Tag,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { EmailTemplate } from "../../types/email";
import { TemplateEditorModal } from "./TemplateEditorModal";
import { SpamCheckerModal } from "./SpamCheckerModal";
import { analyzeSpamScore } from "../../services/emailDeliverabilityService";

export const TemplatesList: React.FC = () => {
  const { templates = [], deleteTemplate } = useCRM();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [spamCheckingTemplate, setSpamCheckingTemplate] = useState<EmailTemplate | null>(null);

  const categories = Array.from(new Set((templates || []).map((t) => t.category).filter(Boolean)));

  const filteredTemplates = (templates || []).filter((t) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterCategory !== "all" && t.category !== filterCategory) {
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
            Plantillas de Email & Copywriting B2B
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Biblioteca de copies comerciales de alto impacto, variables dinámicas y diagnóstico de spam
          </p>
        </div>

        {hasPermission("campaigns.create") && (
          <button
            onClick={() => {
              setEditingTemplateId(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Plantilla</span>
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
              placeholder="Buscar por título, asunto o palabras clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900">{filteredTemplates.length}</strong> plantillas
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tmpl) => {
          const spamAnalysis = analyzeSpamScore(tmpl.subject, tmpl.body);

          return (
            <div
              key={tmpl.id}
              className="p-4 bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl shadow-2xs hover:shadow-sm transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {tmpl.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSpamCheckingTemplate(tmpl)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                      title="Chequear Spam"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTemplateId(tmpl.id);
                        setIsEditorOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(tmpl.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">{tmpl.name}</h3>
                <p className="text-xs font-semibold text-slate-600 mt-1 line-clamp-1">
                  Asunto: {tmpl.subject}
                </p>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans leading-relaxed">
                  {tmpl.body}
                </p>
              </div>

              {/* Footer with Spam Risk and Variables */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    spamAnalysis.riskLevel === "bajo"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Spam: {spamAnalysis.riskLevel} ({spamAnalysis.spamScore}/100)
                </span>

                <span className="text-[11px] text-slate-400 font-medium">
                  {tmpl.variables?.length || 0} variables
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isEditorOpen && (
        <TemplateEditorModal
          isOpen={isEditorOpen}
          templateIdToEdit={editingTemplateId}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplateId(null);
          }}
        />
      )}

      {spamCheckingTemplate && (
        <SpamCheckerModal
          template={spamCheckingTemplate}
          onClose={() => setSpamCheckingTemplate(null)}
        />
      )}
    </div>
  );
};
