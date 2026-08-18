import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { Globe, CheckCircle2, Copy } from "lucide-react";

interface DnsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DnsConfigModal: React.FC<DnsConfigModalProps> = ({ isOpen, onClose }) => {
  const { deliverabilityConfig, updateDeliverabilityConfig } = useCRM();
  const [domain, setDomain] = useState(deliverabilityConfig?.sendingDomain || "yorvar.co");

  const dns = deliverabilityConfig?.dnsStatus || { spf: true, dkim: true, dmarc: true, mx: true };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeliverabilityConfig({
      sendingDomain: domain,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de Registros DNS del Dominio"
      subtitle="Asegura la autenticación criptográfica SPF, DKIM y DMARC de tu dominio"
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Dominio de Remitente</label>
          <input
            type="text"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="ej. yorvar.co"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-slate-800">Registros DNS Requeridos:</h4>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px]">
              <span>Tipo: TXT (SPF)</span>
              <span className="text-emerald-700">Estado: Válido ✓</span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded text-slate-800 break-all select-all">
              {dns.spfRecord}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px]">
              <span>Tipo: TXT (DKIM - Selector yorvar)</span>
              <span className="text-emerald-700">Estado: Válido ✓</span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded text-slate-800 break-all select-all">
              {dns.dkimRecord}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px]">
              <span>Tipo: TXT (DMARC)</span>
              <span className="text-emerald-700">Estado: Válido ✓</span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded text-slate-800 break-all select-all">
              {dns.dmarcRecord}
            </div>
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
            Guardar Dominio
          </button>
        </div>
      </form>
    </Modal>
  );
};
