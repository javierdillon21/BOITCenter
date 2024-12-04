import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar el método
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    // Leer el archivo plantilla desde la carpeta public
    const templatePath = path.join(
      process.cwd(),
      "public",
      "ReportTemplate.xlsx"
    );
    const buffer = fs.readFileSync(templatePath); // Lee el archivo como buffer

    // Cargar el archivo en XLSX
    const workbook = XLSX.read(buffer, { type: "buffer", cellStyles: true });
    const worksheet = workbook.Sheets["Hoja1"];

    // Obtener los datos enviados en el cuerpo de la solicitud
    const informe: Informe = req.body.informe;
    const vulnerabilidades: VulnerabilidadDataTable[] =
      req.body.vulnerabilidades;

    // Modificar celdas en la hoja

    worksheet["B3"].v = informe.nombre;
    worksheet["B4"].v = informe.estado;
    worksheet["B5"].v = informe.emisor;
    worksheet["B6"].v = new Date(informe.fecha_recepcion).toLocaleDateString();
    worksheet["B7"].v = new Date(informe.fecha_entrega).toLocaleDateString();
    worksheet["B8"].v = new Set(vulnerabilidades.map((v) => v.id_equipo)).size;

    // Escribir fechas de compromiso en columna D
    const fechasCompromiso: string[] = Array.isArray(informe.fecha_compromiso)
      ? informe.fecha_compromiso.map((fecha) =>
          new Date(fecha).toLocaleDateString()
        )
      : [new Date(informe.fecha_compromiso).toLocaleDateString()];

    fechasCompromiso.forEach((fecha, index) => {
      const cellAddress = `D${3 + index}`;
      worksheet[cellAddress] = { v: fecha };
    });

    // Calcular totales por estado
    const estados = [
      "Mitigada",
      "Pendiente",
      "Autorización Pendiente",
      "No mitigada",
      "Mitigación programada",
      "Escalada",
    ];
    estados.forEach((estado, index) => {
      const total = vulnerabilidades.filter((v) => v.estado === estado).length;
      const cellAddress = `F${3 + index}`;
      worksheet[cellAddress] = { v: total };
    });

    // Listar vulnerabilidades desde la fila 11
    let startRow = 11;
    vulnerabilidades.forEach((vulnerabilidad) => {
      const row = startRow++;

      worksheet[`A${row}`] = { v: vulnerabilidad.hostname };
      worksheet[`B${row}`] = { v: (vulnerabilidad.ips || []).join(", ") };
      worksheet[`C${row}`] = { v: vulnerabilidad.vulnerabilidad || "" };
      worksheet[`D${row}`] = { v: vulnerabilidad.descripcion || "" };
      worksheet[`E${row}`] = { v: vulnerabilidad.mitigacion_sugerida || "" };
      worksheet[`F${row}`] = { v: vulnerabilidad.observacion || "" };
      worksheet[`G${row}`] = { v: vulnerabilidad.estado || "" };
    });

    console.log(worksheet["A11"]);

    // Actualizar el rango de la hoja para incluir todas las celdas modificadas
    worksheet["!ref"] = `A1:G${startRow - 1}`;
    // Escribir el archivo modificado en un buffer
    const updatedBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Configurar la respuesta para descarga
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=GeneratedReport.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(updatedBuffer);
  } catch (error) {
    console.error("Error generando el reporte:", error);
    res.status(500).json({ error: "Error generando el reporte." });
  }
}
