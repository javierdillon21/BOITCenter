import XLSX from "xlsx";
import { customfieldspanet } from "./panet";
import path from "path";

//UTILITARIOS******************************

const estadoColor: EstadoColor = {
  Mitigada: "#28a745",
  Pendiente: "#CCAF61",
  "Autorización Pendiente": "#C17767",
  Escalada: "#CADBC0",
  "Mitigación programada": "#6D98BA",
  "No mitigada": "#35393C",
};

export function getStatsVulnerabilidades(
  vulnerabilidades: getInformeVulnerabilidadesResponse[]
): DataPie {
  const estadoCounts: { [key: string]: number } = {};

  // Contar las vulnerabilidades por estado
  vulnerabilidades.forEach((vulnerabilidad) => {
    const estado = vulnerabilidad.estado_vulnerabilidad;
    if (estadoCounts[estado]) {
      estadoCounts[estado] += 1;
    } else {
      estadoCounts[estado] = 1;
    }
  });

  // Crear el arreglo de objetos ItemPie
  const dataPie: DataPie = Object.entries(estadoCounts).map(
    ([estado, count]) => ({
      value: count,
      label: estado,
      color: estadoColor[estado] || "#000000", // Color por defecto si no se encuentra el estado
    })
  );

  return dataPie;
}
export function getHeaders(tableFields: TableFields[]): string[] {
  const headers = tableFields.map((field) => {
    let formatedHeader = field.name.replace(/_/g, " ");
    formatedHeader = formatedHeader.toLowerCase();
    formatedHeader =
      formatedHeader.charAt(0).toUpperCase() + formatedHeader.slice(1);
    return formatedHeader;
  });
  return headers;
}

export function getHeadersGen(tableFields: string[]): string[] {
  const headers = tableFields.map((field) => {
    let formatedHeader = field.replace(/_/g, " ");
    formatedHeader = formatedHeader.toLowerCase();
    formatedHeader =
      formatedHeader.charAt(0).toUpperCase() + formatedHeader.slice(1);
    return formatedHeader;
  });
  return headers;
}

export function getValidIPs(ipList: string): string[] {
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ips = ipList.split(";");
  return ips.filter((ip) => ipRegex.test(ip.trim()));
}

export function validarIP(ip: string): boolean {
  //console.log("ips a splitear:", ip);
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ip.split(";").every((ipPart) => ipRegex.test(ipPart.trim()));
}

export function checkFormatRows(array: BodyXLSX): string[] {
  const errores: string[] = [];

  array.forEach((obj, index) => {
    if (typeof obj.CVE !== "string") {
      errores.push(
        `Error en objeto ${index}: CVE no es una cadena de caracteres.`
      );
    }
    if (typeof obj.Descripción !== "string") {
      errores.push(
        `Error en objeto ${index}: Descripción no es una cadena de caracteres.`
      );
    }
    if (typeof obj["Mitigación sugerida"] !== "string") {
      errores.push(
        `Error en objeto ${index}: Mitigación sugerida no es una cadena de caracteres.`
      );
    }
    if (typeof obj.Referencia !== "string") {
      errores.push(
        `Error en objeto ${index}: Referencia no es una cadena de caracteres.`
      );
    }
    if (typeof obj.Vulnerabilidad !== "string") {
      errores.push(
        `Error en objeto ${index}: Vulnerabilidad no es una cadena de caracteres.`
      );
    }
    if (!obj.IP || !validarIP(obj.IP)) {
      errores.push(
        `Error en objeto ${index}: IP no es válida o está vacía. Si es un conjunto de IPs, deben estar separadas por ";"`
      );
    }
  });
  return errores;
}

export function verificarFechaCompromiso(
  fecha_recepcion: string,
  fecha_compromiso: string
): boolean {
  // Convertir las fechas de string a objetos Date
  const recepcion = new Date(fecha_recepcion);
  const compromiso = new Date(fecha_compromiso);

  console.log(`rececpcion: ${recepcion}   compromiso: ${compromiso}`);
  // Verificar que la fecha de recepción sea anterior a la fecha de compromiso
  if (recepcion >= compromiso) {
    return false;
  }

  // Calcular la diferencia en meses entre las dos fechas
  const diffMonths =
    (compromiso.getFullYear() - recepcion.getFullYear()) * 12 +
    (compromiso.getMonth() - recepcion.getMonth());

  // Si la diferencia es mayor a 3 meses, retornar false
  return diffMonths <= 3;
}
export function isValidDate(inputDate: string): boolean {
  const date = new Date(inputDate);
  return !isNaN(date.getTime()); // Retorna true si es una fecha válida, false si no lo es
}

export function formatDate(
  inputDate: string | Date | undefined,
  format?: DateFormats
): string {
  if (!inputDate) return "0000-00-00";
  else {
    const date = new Date(inputDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses comienzan desde 0
    const day = String(date.getDate()).padStart(2, "0");
    switch (format) {
      case "yyyy-mm-dd":
        return `${year}-${month}-${day}`;
      case "dd-mm-yyyy":
        return `${day}-${month}-${year}`;

      default:
        return `${day}/${month}/${year}`;
    }
  }
}

export function calcularRangoFechas(
  fecha_recepcion: string,
  fecha_compromiso: string
): { fecha_min: string; fecha_max: string } {
  // Convertir las fechas de string a objetos Date utilizando Date.parse()
  const recepcion = new Date(Date.parse(fecha_recepcion));
  const compromiso = new Date(Date.parse(fecha_compromiso));

  // Verificar que las fechas sean válidas
  if (isNaN(recepcion.getTime()) || isNaN(compromiso.getTime())) {
    throw new Error("Fechas inválidas");
  }

  // Formatear fecha en formato 'yyyy-mm-dd'
  const formatoFecha = (fecha: Date): string => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fecha mínima es la última fecha de compromiso pasada
  const fecha_min = formatoFecha(compromiso);

  // Calcular la fecha máxima sumando 3 meses a la fecha de recepción
  const fecha_maxima = new Date(recepcion);
  fecha_maxima.setMonth(fecha_maxima.getMonth() + 3);

  // Convertir fecha máxima a formato 'yyyy-mm-dd'
  const fecha_max = formatoFecha(fecha_maxima);

  // Devolver ambas fechas en el formato 'yyyy-mm-dd'
  return { fecha_min, fecha_max };
}

export const expectedTemplate = {
  A1: "Informe:",
  A2: "Emisor:",
  A3: "Fecha recepción:",
  A4: "Fecha compromiso:",
  A6: "IP",
  B6: "Vulnerabilidad",
  C6: "Descripción",
  D6: "CVE",
  E6: "Mitigación sugerida",
  F6: "Referencia",
};

export function checkWorksheetTemplate(
  worksheet: XLSX.WorkSheet,
  valoresEsperados: { [key: string]: string }
): string[] {
  const errores: string[] = [];
  for (const [celda, valorEsperado] of Object.entries(valoresEsperados)) {
    const celdaValor = worksheet[celda] ? worksheet[celda].v : null;
    if (celdaValor !== valorEsperado) {
      errores.push(
        `Error en ${celda}: se esperaba "${valorEsperado}", pero se encontró "${celdaValor}".`
      );
    }
  }

  return errores;
}

/***************** SHEETJS  */

export function generateExcel(
  data: {
    equipos: EquipoXLSX[];
    notFound: BodyXLSX;
  },
  bodyXLSX: BodyXLSX
): XLSX.WorkBook {
  const { equipos, notFound } = data;

  // Filtrar equipos que no tienen como responsable_so a "Juan Carlos Moncayo"
  const equiposNoResponsable = equipos.filter(
    (equipo) => equipo.responsable_so !== "Juan Carlos Moncayo"
  );

  // Crear un mapa de IPs de equipos no responsables
  const ipsNoResponsable = new Set(
    equiposNoResponsable.flatMap((equipo) => equipo.ips)
  );

  // Añadir observaciones a los equipos no responsables
  const rowsNoResponsable = bodyXLSX
    .filter((row) => ipsNoResponsable.has(row.IP))
    .map((row) => ({
      ...row,
      Observación: "BOITC no es responsable del SO del equipo",
    }));

  // Añadir observaciones a los equipos no encontrados
  const rowsNotFound = notFound.map((row) => ({
    ...row,
    Observación: "Equipo no encontrado en Proactivanet",
  }));

  // Combinar todas las filas
  const combinedRows = [...rowsNoResponsable, ...rowsNotFound];

  // Crear una hoja de cálculo a partir de los datos combinados
  const worksheet = XLSX.utils.json_to_sheet(combinedRows);

  // Crear un libro de trabajo y añadir la hoja de cálculo
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  return workbook;
}

export function downloadExcel(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename);
}

export async function downloadExcelInforme(
  informe: Informe,
  vulnerabilidades: VulnerabilidadDataTable[]
) {
  const response = await fetch("/api/generar-reporte", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ informe, vulnerabilidades }),
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GeneratedReport.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    console.error("Error descargando el reporte");
  }
}

export function generarExcelHistoricoVulnerabilidades(
  encabezado: Equipo,
  filas: EquipoVulnerabilidadesResult[]
): XLSX.WorkBook {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();

  // Crear una nueva hoja de trabajo
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  const cellStyleEncabezado = {
    font: { bold: true },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };
  const cellStyleTableHeaders = {
    font: { bold: true },
    border: {
      top: { style: "thin" },
      bottom: { style: "bold" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };
  // Escribir las propiedades del encabezado en las columnas A y B
  let rowIndex = 0;
  for (const [key, value] of Object.entries(encabezado)) {
    //console.log(`${key}: ${value}`);
    worksheet[`A${rowIndex + 1}`] = { t: "s", v: `${key}:` };
    worksheet[`B${rowIndex + 1}`] = { t: "s", v: value };

    rowIndex++;
  }
  rowIndex++;
  rowIndex++;
  // Escribir los nombres de las columnas para las filas de datos
  const columnNames = Object.keys(filas[0]);
  console.log("COLUMNAS:: ", columnNames);

  XLSX.utils.sheet_add_aoa(worksheet, [columnNames], {
    origin: `A${rowIndex}`,
  });
  rowIndex++;

  const data = filas.map((r, i) => {
    return Object.values(r);
  });
  XLSX.utils.sheet_add_aoa(worksheet, data, { origin: `A${rowIndex}` });

  // Añadir la hoja de trabajo al libro de trabajo
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generar el archivo Excel
  return workbook;
}
export function createRecords(
  body: RowXLSX[],
  equipos: EquipoXLSX[]
): RecordXLSX[] {
  const records: RecordXLSX[] = [];

  body.forEach((row) => {
    const ips = row.IP.split(";").map((ip) => ip.trim());
    equipos.forEach((equipo) => {
      if (
        equipo.responsable_so === "Juan Carlos Moncayo" &&
        equipo.ips.some((ip) => ips.includes(ip))
      ) {
        records.push({
          CVE: row.CVE,
          Descripción: row.Descripción,
          IP: ips,
          "Mitigación sugerida": row["Mitigación sugerida"],
          Referencia: row.Referencia,
          Vulnerabilidad: row.Vulnerabilidad,
          id_proactiva: equipo.id_proactiva,
          hostname: equipo.hostname,
          responsable_boitc: equipo.responsable_boitc,
          responsable_so: equipo.responsable_so,
          responsable_servicio: equipo.responsable_servicio,
          sistema_operativo: equipo.sistema_operativo,
          descripcion: equipo.descripcion,
          tipo: equipo.tipo,
          clasificaciones: equipo.clasificaciones,
          localizacion: equipo.localizacion,
          hipervisor: equipo.hipervisor,
        });
      }
    });
  });

  return records;
}
XLSX;

export const estadosVulnerabilidad = [
  "Mitigada",
  "Pendiente",
  "Autorización Pendiente",
  "Escalada",
  "Mitigación programada",
  "No mitigada",
];
