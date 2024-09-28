import XLSX from "xlsx";
import { customfieldspanet } from "./panet";
export function parseToURL(obj: RequestProperties) {
  const url = `/api/pgsql/${obj.type}?id=${obj.id}${`${
    obj.limit ? `?limit=${obj.limit}` : ""
  }`}${`${obj.data ? `?data=${obj.data}` : ""}`}`;
  return url;
}

export async function getDataDB(req: RequestProperties) {
  const url = parseToURL(req);
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(data)
  });
  return response.json();
}

export async function postDataDB(req: RequestProperties) {
  const url = parseToURL(req);
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.data),
  });
  return response.json();
}

//CONSULTAS API PROACTIVANET******************************

//***********GET */
export async function getPcByHostnamePanet(req: RequestPanetProperties) {
  const url = `http://10.191.204.61/proactivanet/api/Pcs?Hostname=${req.fields}$fields=${req.fields}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(data)
  });
  return response.json();
}

export async function listPcsRawPanet(req: RequestPanetProperties) {
  const url = `/api/panet/listPcsRaw`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export async function listPcsIPPanet(req: RequestPanetProperties) {
  const url = `/api/panet/listPcsIP?$fields=ListIPs`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

//***********POST */

export async function listPcsPanet(
  req: RequestPanetProperties,
  data: BodyXLSX
): Promise<{ equipos: Equipo[]; notFound: BodyXLSX }> {
  const url = `/api/panet/listPcs`;
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export function findMatchingObjects(
  ipString: string,
  objects: PcListIp
): PcListIp {
  // Divide el string de IPs en una lista
  const ipList = ipString.split(";");

  // Inicializa una lista para almacenar los objetos coincidentes
  const matchingObjects: PcListIp = [];

  // Itera sobre cada objeto en la lista
  for (const obj of objects) {
    // Verifica si todas las IPs en ipList están presentes en ListIPs del objeto
    if (ipList.every((ip) => obj.ListIPs.includes(ip))) {
      matchingObjects.push(obj);
    }
  }

  return matchingObjects;
}

//VARIOS******************************

export function PushDataToDB() {
  /*1. recuperar la info completa de los equipos consultando a PANET
    2. crear los registros en la base
  */
}

export function createInforme() {}

export function createVulnerabilidad() {}

export function createEquipo() {}

export function createInformeEquipo() {}
export function createInformeVulnerabilidad() {}

export function createEquipoVulnerabilidad() {}

//UTILITARIOS******************************

export function getValidIPs(ipList: string): string[] {
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ips = ipList.split(";");
  return ips.filter((ip) => ipRegex.test(ip.trim()));
}

export function validarIP(ip: string): boolean {
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

export function filterPcListIps(
  rows: BodyXLSX,
  pcList: PcListIps
): { found: PcListIps; notFound: BodyXLSX } {
  const allRowIps = rows.flatMap((row) =>
    row.IP.split(";").map((ip) => ip.trim())
  );
  const found: PcListIps = [];
  const notFound: BodyXLSX = [];

  pcList.forEach((pc) => {
    const pcIps = Array.isArray(pc.ListIPs)
      ? pc.ListIPs
      : pc.ListIPs.split(";").map((ip) => ip.trim());
    if (pcIps.some((ip) => allRowIps.includes(ip))) {
      found.push(pc);
    }
  });

  rows.forEach((row) => {
    const rowIps = row.IP.split(";").map((ip) => ip.trim());
    const isFound = pcList.some((pc) => {
      const pcIps = Array.isArray(pc.ListIPs)
        ? pc.ListIPs
        : pc.ListIPs.split(";").map((ip) => ip.trim());
      return pcIps.some((ip) => rowIps.includes(ip));
    });
    if (!isFound) {
      notFound.push(row);
    }
  });

  return { found, notFound };
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

// ************************

async function fetchCustomFieldData(
  entityId: string,
  customFieldId: string,
  token: string
): Promise<string> {
  const response = await fetch(
    `http://10.191.204.61/proactivanet/api/Pcs/${entityId}/customFields/${customFieldId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token,
        "Accept-Language": "es",
      },
    }
  );
  const data = await response.json();
  return data.View; // Ajusta esto según la estructura de la respuesta de la API
}

async function fetchSystemInfo(
  entityId: string,
  token: string
): Promise<{
  sistema_operativo: string;
  localizacion: string;
  hostname: string;
}> {
  const response = await fetch(
    `http://10.191.204.61/proactivanet/api/Pcs?Id=${entityId}&$fields=Hostname,LocationTranslatedPath,OsName`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token,
        "Accept-Language": "es",
      },
    }
  );
  const data = await response.json();

  return {
    sistema_operativo: data[0].OsName,
    localizacion: data[0].LocationTranslatedPath,
    hostname: data[0].Hostname,
  };
}

async function fetchClassifications(
  entityId: string,
  token: string
): Promise<string> {
  const response = await fetch(
    `http://10.191.204.61/proactivanet/api/Pcs/${entityId}/classifications`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token,
        "Accept-Language": "es",
      },
    }
  );
  const data = await response.json();
  return data[0].Path;
}

async function buildEquipo(
  row: RowXLSX,
  pc: { ListIPs: string | string[]; Id: string },
  token: string
): Promise<Equipo> {
  const customFieldData = await Promise.all(
    customfieldspanet.map((field) =>
      fetchCustomFieldData(pc.Id, field.CustomField_id, token)
    )
  );

  const customFieldMap = customFieldData.reduce((acc, view, index) => {
    acc[customfieldspanet[index].name] = view;
    return acc;
  }, {} as Record<string, any>);

  const systemInfo = await fetchSystemInfo(pc.Id, token);
  const classifications = await fetchClassifications(pc.Id, token);

  return {
    ips: row.IP.split(";").map((ip) => ip.trim()),
    id_proactiva: pc.Id,
    hostname: systemInfo.hostname || "",
    responsable_boitc: customFieldMap["Responsable BOITC"] || "",
    responsable_so: customFieldMap["Respon. S.O"] || "",
    responsable_servicio: customFieldMap["Respon. Aplicación"] || "",
    sistema_operativo: systemInfo.sistema_operativo || "",
    descripcion: customFieldMap["Descripción /Funcionalidad"] || "",
    tipo: customFieldMap["Tipo"] || "",
    clasificaciones: classifications || "",
    localizacion: systemInfo.localizacion || "",
    hipervisor: customFieldMap["Hipervisor/Modelo"] || "",
  };
}

export async function processRows(
  rows: BodyXLSX,
  pcList: PcListIps,
  token: string
): Promise<{ equipos: Equipo[]; notFound: BodyXLSX }> {
  const { found, notFound } = filterPcListIps(rows, pcList);

  const equipos = await Promise.all(
    found
      .map((pc) => {
        const row = rows.find((r) =>
          r.IP.split(";").some((ip) => pc.ListIPs.includes(ip.trim()))
        );
        if (row) {
          return buildEquipo(row, pc, token);
        }
        return null;
      })
      .filter((equipo) => equipo !== null) as Promise<Equipo>[]
  );

  return { equipos, notFound };
}

/***************** SHEETJS  */

/*export function generateExcel(data: BodyXLSX): XLSX.WorkBook {
  const dataWithObservation = data.map(row => ({
    ...row,
    Observación: "Equipo no encontrado en Proactivanet"
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataWithObservation);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  return workbook;
}

export function downloadExcel(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename);
}*/

export function generateExcel(
  data: {
    equipos: Equipo[];
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
