import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useCRM } from "../../context/CRMContext";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowRight, ArrowLeft } from "lucide-react";

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadImportModal: React.FC<LeadImportModalProps> = ({ isOpen, onClose }) => {
  const { addLead, users = [], suppressionList = [] } = useCRM();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csvText, setCsvText] = useState(
    `Nombre,Apellido,Empresa,Cargo,Email,Telefono,Ciudad,Sector\nCarlos,Mendoza,Inversiones Andinas,CEO,carlos.m@andinas.com,+57 311 555 1234,Bogotá,Financiero\nLuisa,Gómez,Transportes del Norte,VP Logística,luisa.g@transnorte.co,+57 315 888 4321,Medellín,Logística\nFelipe,Salazar,BioSalud Colombia,Director Comercial,felipe.s@biosalud.com,+57 320 777 9900,Cali,Salud`
  );
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const handleParse = () => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
      alert("Por favor ingresa al menos una fila de datos además del encabezado.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const data = lines.slice(1).map((line, idx) => {
      const values = line.split(",").map((v) => v.trim());
      const rowObj: any = { id: `import-row-${idx}` };
      headers.forEach((h, i) => {
        rowObj[h] = values[i] || "";
      });
      return rowObj;
    });

    setParsedRows(data);
    setStep(2);
  };

  const handleFinishImport = () => {
    let importedCount = 0;
    parsedRows.forEach((row) => {
      const email = row["Email"] || row["email"] || `prospecto-${Date.now()}@empresa.com`;
      const isSuppressed = suppressionList.some((s) => s.email.toLowerCase() === email.toLowerCase());

      if (!isSuppressed) {
        addLead({
          name: row["Nombre"] || row["nombre"] || "Prospecto",
          lastName: row["Apellido"] || row["apellido"] || "",
          company: row["Empresa"] || row["empresa"] || "Empresa B2B",
          jobTitle: row["Cargo"] || row["cargo"] || "Decisor Comercial",
          email,
          phone: row["Telefono"] || row["telefono"] || "",
          city: row["Ciudad"] || row["ciudad"] || "Bogotá",
          country: "Colombia",
          source: "Importación Masiva CSV",
          status: "nuevo",
          score: 65,
          scoreLevel: "tibio",
          assignedToUserId: users[0]?.id || "usr-1",
          assignedToName: `${users[0]?.name || "Vendedor"} ${users[0]?.lastName || ""}`,
        });
        importedCount++;
      }
    });

    alert(`¡Éxito! Se importaron ${importedCount} prospectos a la base de datos.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asistente de Importación Asistida de Leads"
      subtitle="Carga y mapea listas de prospectos CSV con detección de duplicados"
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs">
        {step === 1 && (
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center gap-3">
              <UploadCloud className="w-8 h-8 text-indigo-600 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900">Pega o edita los datos en formato CSV:</h4>
                <p className="text-slate-500 text-[11px]">
                  Encabezados recomendados: Nombre, Apellido, Empresa, Cargo, Email, Telefono, Ciudad, Sector
                </p>
              </div>
            </div>

            <div>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleParse}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                Analizar & Mapear Columnas →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Vista previa de registros detectados ({parsedRows.length} prospectos)
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mapeo automático listo
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-2.5">Nombre</th>
                    <th className="p-2.5">Empresa</th>
                    <th className="p-2.5">Cargo</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Teléfono</th>
                    <th className="p-2.5">Ciudad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">
                        {r.Nombre} {r.Apellido}
                      </td>
                      <td className="p-2.5 text-slate-700">{r.Empresa}</td>
                      <td className="p-2.5 text-slate-500">{r.Cargo}</td>
                      <td className="p-2.5 text-indigo-600 font-medium">{r.Email}</td>
                      <td className="p-2.5 text-slate-600">{r.Telefono}</td>
                      <td className="p-2.5 text-slate-500">{r.Ciudad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold"
              >
                ← Volver a editar
              </button>
              <button
                onClick={handleFinishImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors"
              >
                Confirmar e Importar {parsedRows.length} Leads 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
