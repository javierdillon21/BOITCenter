import { useEffect, useState } from "react";
import XLSX from "xlsx";
import Header from "../../components/header";
import Table from "../../components/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {
  expectedTemplate,
  listPcsPanet,
  checkFormatRows,
  checkWorksheetTemplate,
  generateExcel,
  downloadExcel,
} from "@/utils/functions";

export default function Import() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<HeaderXLSX>();
  const [file, setFile] = useState<File>();
  const [upload, setupload] = useState<boolean>(true);
  const [errorStack, setErrorStack] = useState();
  const [errorAlert, setErrorAlert] = useState<string>();
  const [panetCheck, setPanetCheck] = useState<{
    equipos: Equipo[];
    notFound: BodyXLSX;
  } | null>(null);

  const handlePanetChecking = async (data: any[]) => {
    try {
      const response = await listPcsPanet({ id: "dd" }, data);
      setPanetCheck(response);

      setErrorAlert("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorAlert("Error fetching data");
    }
  };

  useEffect(() => {
    if (panetCheck?.notFound.length !== 0) {
      setErrorAlert(
        "Existen equipos con novedades. Descargue el reporte para más información"
      );
    }
  }, [panetCheck]);
//sssss
  useEffect(() => {
    setErrorAlert("");
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e: ProgressEvent<FileReader>) {
        try {
          const workbook = XLSX.read(e.target?.result, { cellDates: true });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const templateErrors = checkWorksheetTemplate(
            worksheet,
            expectedTemplate
          );
          if (templateErrors.length > 0)
            throw new Error(`FormatTemplateError: ${templateErrors}`);

          const metadata: HeaderXLSX = {
            informe: worksheet["B1"].w,
            emisor: worksheet["B2"].w,
            fecha_compromiso: worksheet["B3"].w,
            fecha_recepcion: worksheet["B4"].w,
          };

          const body: BodyXLSX = XLSX.utils.sheet_to_json(worksheet, {
            defval: "N/A",
            dateNF: "yyyy-mm-dd",
            range: "A6:F9999",
          });
          const rowsErrors = checkFormatRows(body);
          if (rowsErrors.length > 0)
            throw new Error(`FormatRowsError: ${rowsErrors}`);

          setMetadata(metadata);
          setData(body);
        } catch (e) {
          console.error(e);
          if (
            String(e).includes(
              "ECMA-376 Encrypted file missing /EncryptionInfo"
            )
          ) {
            setErrorAlert(
              "Archivo no público. Por favor, cambie la visibilidad del archivo a Public"
            );
          } else if (
            String(e).includes(
              "TypeError: Cannot read properties of undefined (reading 'w')"
            )
          ) {
            setErrorAlert("Existen campos de metadata vacíos");
          } else if (String(e).includes("Format")) {
            setErrorAlert(
              "Formato incorrecto. Por favor, use la plantilla y el formato correcto de los campos"
            );
          }
        }
      };
      reader.readAsArrayBuffer(file as File);
    }
  }, [file]);

  function cleaner() {
    setMetadata(undefined);
    setData([]);
    setFile(undefined);
    setErrorAlert("");
    setPanetCheck(null);
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const f = files?.item(0);
    if (f) {
      setFile(f);
    } else {
      cleaner();
    }
  }

  const handleDownloadReporte = (
    panetResponse: {
      equipos: Equipo[];
      notFound: BodyXLSX;
    },
    rows: BodyXLSX
  ) => {
    const workbook = generateExcel(panetResponse, rows);
    downloadExcel(workbook, "reporte.xlsx");
  };
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 font-normal">
      <Header title="Importar"></Header>
      <div className="flex flex-col gap-y-2">
        <div className="relative flex flex-row items-end h-12 gap-1">
          <input
            accept=".xls,.xlsx"
            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
            type="file"
            onChange={(e) => handleFile(e)}
          ></input>

          <a href="/FORMATO DE INFORME AIC BOITC.xlsx" download>
            <button
              className="tooltip btn btn-sm flex items-center self-start shadow-md text-sm"
              data-tip="Descargar plantilla"
            >
              <FontAwesomeIcon
                icon={"file-download"}
                className="text-slate-800"
              ></FontAwesomeIcon>
            </button>
          </a>

          {errorAlert && (
            <span className="absolute top-0 right-0 flex items-center justify-self-end h-10 text-xs font-bold border gap-3 px-3 py-1 rounded-xl shadow-lg">
              <FontAwesomeIcon
                icon="warning"
                size="xl"
                className="text-yellow-600 animate-pulse"
              ></FontAwesomeIcon>
              {errorAlert}
            </span>
          )}
        </div>
        {file && data.length == 0 && (
          <div className="flex flex-col h-128 border justify-center items-center font-bold text-sm text-gray-700">
            <span className="loading loading-bars loading-lg"></span>
            Leyendo el archivo
          </div>
        )}
        {data.length !== 0 && (
          <section className="flex flex-col text-sm gap-y-2">
            <div className="grid grid-cols-[600px_1fr] w-full">
              <div className="grid grid-cols-2 py-2 gap-1">
                <p className="text-sm font-bold items-center">VISTA PREVIA</p>
                <span></span>
                <span className="text-black font-medium">
                  Informe:{" "}
                  <p className="badge badge-lg text-sm bg-slate-700 text-gray-200">
                    {metadata?.informe}
                  </p>
                </span>
                <span className="text-black font-semibold">
                  Emisor:{" "}
                  <p className="badge badge-lg text-sm bg-slate-700 text-gray-200">
                    {metadata?.emisor}
                  </p>
                </span>
                <span className="text-black font-semibold">
                  Fecha de recepción:{" "}
                  <p className="badge badge-lg text-sm bg-slate-700 text-gray-200">
                    {metadata?.fecha_recepcion}
                  </p>
                </span>
                <span className="text-black font-semibold">
                  Fecha de compromiso:{" "}
                  <p className="badge badge-lg text-sm bg-slate-700 text-gray-200">
                    {metadata?.fecha_compromiso}
                  </p>
                </span>
              </div>
              <div className="flex items-end py-2 gap-2 justify-end">
                <button
                  className="btn btn-sm shadow-md"
                  onClick={async (e) => {
                    e.preventDefault();
                    handlePanetChecking(data);
                  }}
                >
                  Validar datos
                  <FontAwesomeIcon icon={"check-to-slot"}></FontAwesomeIcon>
                </button>
                {panetCheck?.notFound && (
                  <button
                    className="tooltip btn btn-sm flex shadow-md"
                    data-tip="Descargar reporte"
                    onClick={async (e) => {
                      e.preventDefault();
                      handleDownloadReporte(panetCheck, data);
                    }}
                  >
                    Reporte
                    <FontAwesomeIcon
                      icon={"exclamation-circle"}
                    ></FontAwesomeIcon>
                  </button>
                )}
              </div>
            </div>
            <Table
              size="small"
              data={data}
              header={Object.keys(data[0])}
            ></Table>
          </section>
        )}
      </div>
    </main>
  );
}
