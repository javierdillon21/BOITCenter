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

export async function listPcsRawPanet() {
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

export async function listPcsIPPanet() {
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
): Promise<{ equipos: EquipoXLSX[]; notFound: BodyXLSX }> {
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

///////******************** */

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

async function fetchCustomFieldData(
  entityId: string,
  token: string
): Promise<{ name: string; view: string }[]> {
  try {
    const response = await fetch(
      `http://10.191.204.61/proactivanet/api/Pcs/${entityId}/customFields`,
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

    const customFieldData = data.map((apiItem: any) => {
      const customField = customfieldspanet.find(
        (field) => field.CustomField_id === apiItem.CustomField_id
      );
      console.log(customField)
      return customField
        ? { name: customField.name, view: apiItem.View }
        : {name: "", view: ""};
    });
    return customFieldData; // Ajusta esto según la estructura de la respuesta de la API
  } catch (error) {
    console.log("ERROR: ", error);
    return [];
  }
  //console.log("DATAAAAAAAAAAAAAAAAA: ",data, entityId)
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

export async function processRows(
  rows: BodyXLSX,
  pcList: PcListIps,
  token: string
): Promise<{ equipos: EquipoXLSX[]; notFound: BodyXLSX }> {
  const { found, notFound } = filterPcListIps(rows, pcList);
  //console.log("FOUND: ", found)
  //console.log("FOUND: ", notFound)

  const equipos = await Promise.all(
    found
      .map((pc) => {
        const row = rows.find((r) =>
          r.IP.split(";").some((ip) => pc.ListIPs.includes(ip.trim()))
        );
        if (row) {
          console.log("IPS: ", row.IP);
          return buildEquipo(row, pc, token);
        }
        return null;
      })
      .filter((equipo) => equipo !== null) as Promise<EquipoXLSX>[]
  );
  console.log("RESPUESTA:::::: ", equipos, notFound);
  return { equipos, notFound };
}

async function buildEquipo(
  row: RowXLSX,
  pc: { ListIPs: string | string[]; Id: string },
  token: string
): Promise<EquipoXLSX> {
  const customFieldData = await fetchCustomFieldData(pc.Id, token);

  /*const customFieldMap = customFieldData.reduce((acc, view, index) => {
    acc[customfieldspanet[index].name] = view;
    return acc;
  }, {} as Record<string, any>);*/

  //console.log(customFieldData)
  const customFieldMap = customFieldData.reduce((acc, item) => {
    acc[item.name] = item.view;
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

export const customfieldspanet: CustomFieldsPanet = [
  {
    CustomField_id: "784f5de3-656e-4e16-a3a3-0233758e20a2",
    Href: "http://10.191.204.61/proactivanet/api/customfields/784f5de3-656e-4e16-a3a3-0233758e20a2",
    name: "Tipo",
  },
  {
    CustomField_id: "24bdaca6-5b93-46e5-be3b-0d0a9520986e",
    Href: "http://10.191.204.61/proactivanet/api/customfields/24bdaca6-5b93-46e5-be3b-0d0a9520986e",
    name: "Seguridad Usuario",
  },
  {
    CustomField_id: "3995f994-12d2-477b-9ca5-125ea132cdae",
    Href: "http://10.191.204.61/proactivanet/api/customfields/3995f994-12d2-477b-9ca5-125ea132cdae",
    name: "VDC/Marca",
  },
  {
    CustomField_id: "593fe26e-b3b3-4367-bc04-21f6c7e7f5d7",
    Href: "http://10.191.204.61/proactivanet/api/customfields/593fe26e-b3b3-4367-bc04-21f6c7e7f5d7",
    name: "Grafana",
  },
  {
    CustomField_id: "57c2be66-6aeb-4c24-9eb5-26a7c2b72698",
    Href: "http://10.191.204.61/proactivanet/api/customfields/57c2be66-6aeb-4c24-9eb5-26a7c2b72698",
    name: "Respaldo Tipo",
  },
  {
    CustomField_id: "1d2a1309-819d-4178-9526-30ffb0bbf36e",
    Href: "http://10.191.204.61/proactivanet/api/customfields/1d2a1309-819d-4178-9526-30ffb0bbf36e",
    name: "EDR Observación",
  },
  {
    CustomField_id: "cb296d97-a2d0-4d6a-9719-3fd11225dde8",
    Href: "http://10.191.204.61/proactivanet/api/customfields/cb296d97-a2d0-4d6a-9719-3fd11225dde8",
    name: "Respon. Aplicación",
  },
  {
    CustomField_id: "c0a163a9-bf33-456e-a2b6-56485de016c9",
    Href: "http://10.191.204.61/proactivanet/api/customfields/c0a163a9-bf33-456e-a2b6-56485de016c9",
    name: "Respaldo Retención",
  },
  {
    CustomField_id: "e47f93f8-20ba-4b70-a964-5bd73831e381",
    Href: "http://10.191.204.61/proactivanet/api/customfields/e47f93f8-20ba-4b70-a964-5bd73831e381",
    name: "Rundeck",
  },
  {
    CustomField_id: "9be8ea27-50d8-489d-8db3-657acb8f123c",
    Href: "http://10.191.204.61/proactivanet/api/customfields/9be8ea27-50d8-489d-8db3-657acb8f123c",
    name: "IP Externa",
  },
  /*{
    CustomField_id: "d07ecc86-c45b-4450-85d2-665174a8143f",
    Href: "http://10.191.204.61/proactivanet/api/customfields/d07ecc86-c45b-4450-85d2-665174a8143f",
    name: "Respaldo",
  },*/
  {
    CustomField_id: "7cfec147-045e-428e-b0a6-692c2ef88d1d",
    Href: "http://10.191.204.61/proactivanet/api/customfields/7cfec147-045e-428e-b0a6-692c2ef88d1d",
    name: "SOX",
  },
  {
    CustomField_id: "5b56d78f-e7ae-4634-af7c-8658563345be",
    Href: "http://10.191.204.61/proactivanet/api/customfields/5b56d78f-e7ae-4634-af7c-8658563345be",
    name: "Hipervisor/Modelo",
  },
  {
    CustomField_id: "1422338d-b7ff-47d9-b250-b7479d879590",
    Href: "http://10.191.204.61/proactivanet/api/customfields/1422338d-b7ff-47d9-b250-b7479d879590",
    name: "ISO 27001",
  },
  {
    CustomField_id: "78c3b5fc-1b13-400d-8fde-bd91eb0774f1",
    Href: "http://10.191.204.61/proactivanet/api/customfields/78c3b5fc-1b13-400d-8fde-bd91eb0774f1",
    name: "EDR",
  },
  {
    CustomField_id: "3e8db758-a7fa-4ec9-b3cb-de47a9c3ac4c",
    Href: "http://10.191.204.61/proactivanet/api/customfields/3e8db758-a7fa-4ec9-b3cb-de47a9c3ac4c",
    name: "Responsable BOITC",
  },
  {
    CustomField_id: "291d27c9-cb63-44b7-ac2c-e3acb5f28860",
    Href: "http://10.191.204.61/proactivanet/api/customfields/291d27c9-cb63-44b7-ac2c-e3acb5f28860",
    name: "Respaldo Periodicidad",
  },
  {
    CustomField_id: "0f65d3ed-40e7-4c28-9d7f-fc9b23eb8374",
    Href: "http://10.191.204.61/proactivanet/api/customfields/0f65d3ed-40e7-4c28-9d7f-fc9b23eb8374",
    name: "Descripción /Funcionalidad",
  },
  {
    CustomField_id: "f563bd9c-0b84-42d9-b0ae-fe33d8909885",
    Href: "http://10.191.204.61/proactivanet/api/customfields/f563bd9c-0b84-42d9-b0ae-fe33d8909885",
    name: "Respon. S.O",
  },
];
