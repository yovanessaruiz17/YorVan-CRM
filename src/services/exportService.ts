export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === null || val === undefined) {
            return '""';
          }
          if (typeof val === "object") {
            val = JSON.stringify(val);
          }
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        })
        .join(",")
    ),
  ].join("\r\n");

  // Add UTF-8 Byte Order Mark (BOM) so Excel reads accents and ñ properly
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
