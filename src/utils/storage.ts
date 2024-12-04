export async function getArchivos(informe_nombre: string, file_id?: string) {
  const url = `/api/storage/upload?informe_nombre=${informe_nombre}&file_id=${file_id}`;
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify({ req: reqType, data: input }),
  });
  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
  const fileName = fileNameMatch ? fileNameMatch[1] : "DocumentosSoporte";
  var file = new File([blob], fileName);
  return file;
}
export async function addArchivos(
  id_informe: string,
  nombre_informe: string,
  files: FormData
) {
  const url = `/api/storage/upload`;

  // Agregar los parámetros id_informe y nombre_informe al FormData
  files.append("id_informe", id_informe);
  files.append("nombre_informe", nombre_informe);

  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "same-origin",
    body: files, // Aquí ya va el FormData incluyendo los archivos y datos
  });

  return response.json();
}
