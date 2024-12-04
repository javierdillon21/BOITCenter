export async function getVulnerabilidadFromInforme(id_vulnerabilidad: string) {
  const url = `/api/pgsql/vulnerabilidad/getVulnerabilidadFromInforme?id_vulnerabilidad=${id_vulnerabilidad}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}
export async function updateEstadoVulnerabilidad(
  reqType: RequestType,
  input: InputValues
) {
  const url = `/api/pgsql/vulnerabilidad/${reqType}`;
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}

export async function updatePropsVulnerabilidad(
  reqType: RequestType,
  input: InputValues
) {
  const url = `/api/pgsql/vulnerabilidad/${reqType}`;
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}

export async function updateInformeCompromiso(
  input: updateInformeCompromisoInput
) {
  const url = "/api/pgsql/informe/updateInformeCompromiso";
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ req: "updateInformeCompromiso", data: input }),
  });
  return response.json();
}

export async function updateInformeEntrega(input: updateInformeEntregaInput) {
  const url = "/api/pgsql/informe/updateInformeEntrega";
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ req: "updateInformeEntrega", data: input }),
  });
  return response.json();
}

export async function submitInforme(input: submitInformeInput) {
  const url = "/api/pgsql/informe/submitInforme";
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ req: "submitInforme", data: input }),
  });
  return response.json();
}

export async function deleteInforme(input: deleteInformeInput) {
  const url = "/api/pgsql/informe/deleteInforme";
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ req: "deleteInforme", data: input }),
  });
  return response.json();
}

export async function getInforme(nombre?: string) {
  const url = `/api/pgsql/informe/getInforme?nombre=${nombre}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}
export async function getInformeVulnerabilidades(nombre?: string) {
  const url = `/api/pgsql/informe/getInformeVulnerabilidades?nombre=${nombre}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}

export async function listRecord(reqType: RequestType) {
  const url = `/api/pgsql/informe/${reqType}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}

export async function listEquipo() {
  const url = `/api/pgsql/equipo/listEquipo`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}

export async function getEquipo(id: string) {
  const url = `/api/pgsql/equipo/getEquipo?id=${id}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ data: id }),
  });
  return response.json();
}

export async function getEquipoVulnerabilidades(id: string) {
  const url = `/api/pgsql/equipo/getEquipoVulnerabilidades?id=${id}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ data: id }),
  });
  return response.json();
}

export async function listVulnerabilidadesEstado() {
  const url = `/api/pgsql/vulnerabilidad/listVulnerabilidadesEstado`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ data: id }),
  });
  return response.json();
}

export async function getArchivosFromInforme(id: string) {
  const url = `/api/pgsql/informe/getArchivosFromInforme?id=${id}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ req: reqType, data: input }),
  });
  return response.json();
}
