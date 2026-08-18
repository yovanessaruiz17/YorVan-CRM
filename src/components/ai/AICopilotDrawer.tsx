import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  Target,
  FileText,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { requestAIAssistant } from "../../services/geminiService";

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  data?: any;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { leads = [], opportunities = [] } = useCRM();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: "¡Hola! Soy tu AI Sales Copilot. Puedo ayudarte a redactar correos de prospección fríos sin spam, sugerir la siguiente mejor acción (Next Best Action) para cualquier lead, manejar objeciones de precios o calificar oportunidades en tu pipeline. ¿En qué te apoyo hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const topLead = leads[0];
      const res = await requestAIAssistant({
        type: "draft_email",
        prompt: textToSend,
        leadData: topLead,
      });

      let aiResponseText = "";
      if (res.result?.body) {
        aiResponseText = `**Asunto Sugerido:** ${res.result.subject || "Propuesta Comercial"}\n\n${res.result.body}`;
      } else if (res.result?.summary) {
        aiResponseText = `**Resumen Ejecutivo:**\n${res.result.summary}\n\n**Dolores Clave:**\n${res.result.keyPainPoints?.map((p: string) => `• ${p}`).join("\n")}\n\n**Siguiente Paso Recomendado:**\n${res.result.suggestedNextStep}`;
      } else if (res.result?.actionTitle) {
        aiResponseText = `**Acción Recomendada:** ${res.result.actionTitle} (${res.result.urgency} Urgencia)\n\n**Justificación:** ${res.result.reasoning}\n\n**Script Telefónico Sugerido:**\n"${res.result.suggestedScript}"`;
      } else {
        aiResponseText = res.result?.response || "He analizado tus datos comerciales. Te recomiendo priorizar el contacto con decisores de compra con score mayor a 80 puntos.";
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: "Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/80 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Sales Copilot</h3>
              <p className="text-[11px] text-indigo-200">Asistente comercial inteligente con Gemini</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <button
            onClick={() => handleSend("Redacta un correo en frío para un Director de Operaciones B2B enfocado en ahorro de costos")}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold rounded-lg border border-slate-200 shrink-0 transition-colors"
          >
            ✉️ Redactar Cold Email
          </button>
          <button
            onClick={() => handleSend("¿Cómo responder a la objeción 'Tu solución es muy costosa frente a la competencia'?")}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold rounded-lg border border-slate-200 shrink-0 transition-colors"
          >
            🛡️ Manejo de Objeción Precio
          </button>
          <button
            onClick={() => handleSend("Sugerir la Siguiente Mejor Acción para avanzar las oportunidades estancadas")}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold rounded-lg border border-slate-200 shrink-0 transition-colors"
          >
            🎯 Next Best Action
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 relative group ${
                  m.sender === "user"
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/80"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {m.sender === "ai" && (
                    <button
                      onClick={() => handleCopy(m.text, m.id)}
                      className="flex items-center gap-1 hover:text-indigo-600 font-bold"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI Copilot está analizando la mejor estrategia comercial...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Pregúntale al Copilot (ej. Redacta follow-up, analiza lead...)"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
