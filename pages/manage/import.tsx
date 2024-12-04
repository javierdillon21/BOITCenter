import { useEffect, useState } from "react";
import XLSX from "xlsx";
import Header from "../../components/header";
import Table from "../../components/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  expectedTemplate,
  checkFormatRows,
  checkWorksheetTemplate,
  generateExcel,
  downloadExcel,
  createRecords,
  verificarFechaCompromiso,
  formatDate,
} from "@/utils/functions";
import Modal from "../../components/modal";
import Alert, { AlertTypes } from "../../components/alert";
import { useRouter } from "next/router";
import { listPcsPanet } from "@/utils/panet";
import { submitInforme } from "@/utils/postgresql";

export default function Import() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<HeaderXLSX>();
  const [file, setFile] = useState<File>();
  const [isPanetChecking, setIsPanetChecking] = useState(false);
  const [isInformeSubmitting, setIsInformeSubmitting] = useState(false);
  const [alert, setAlert] = useState<AlertProps | null>();
  const [panetCheck, setPanetCheck] = useState<{
    equipos: EquipoXLSX[];
    notFound: BodyXLSX;
  } | null>(null);

  const [modalDataSubmit, setModalDataSubmit] = useState<boolean>(false);
  const handlePanetChecking = async (data: any[]) => {
    try {
      setIsPanetChecking(true);
      const response = await listPcsPanet({ id: "dd" }, data);
      setPanetCheck(response);
      console.log("RESPUESTA EN EL CLIENTE:::::",response)
      setIsPanetChecking(false);
      setAlert(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlert({ text: "Error fetching data", type: AlertTypes.error });
    }
  };
  const handleSubmitInforme = (data: BodyXLSX, equipos: EquipoXLSX[]) => {
    const records = createRecords(data, equipos);
    try {
      setIsInformeSubmitting(true);
      submitInforme({
        records: records,
        metadata: metadata as HeaderXLSX,
      }).then((res) => {
        if (res.message) {
          setAlert({
            text: "Informe cargado existosamente!",
            type: AlertTypes.success,
          });
          setTimeout(() => {
            router.reload();
          }, 3000);
        } else {
          setAlert({
            text: "Hubo un error al cargar el informe",
            type: AlertTypes.error,
          });
        }
        setIsInformeSubmitting(false);
      });
    } catch (error) {}
  };
  useEffect(() => {
    if (panetCheck?.notFound.length !== 0) {
      setAlert({
        text: "Existen equipos con novedades. Descargue el reporte para más información",
        type: AlertTypes.warning,
      });
    }
  }, [panetCheck]);

  useEffect(() => {
    setAlert(null);
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
            fecha_recepcion: worksheet["B3"].w,
            fecha_compromiso: worksheet["B4"].w,
          };

          const body: BodyXLSX = XLSX.utils.sheet_to_json(worksheet, {
            defval: "N/A",
            dateNF: "yyyy-mm-dd",
            range: "A6:F9999",
          });
          const checkDates = verificarFechaCompromiso(metadata.fecha_recepcion, metadata.fecha_compromiso)
          if(!checkDates) throw new Error(`DatesError: Las fechas ingresadas no son correctas o su diferencia es mayor a 3 meses`);
          const rowsErrors = checkFormatRows(body);
          if (rowsErrors.length > 0)
            throw new Error(`FormatRowsError: ${rowsErrors}`);

          setMetadata(metadata);
          setData(body);
          setAlert({
            text: "Formato correcto. Lectura exitosa",
            type: AlertTypes.success,
          });
        } catch (e) {
          console.error(e);
          if (
            String(e).includes(
              "ECMA-376 Encrypted file missing /EncryptionInfo"
            )
          ) {
            setAlert({
              text: "Archivo no público. Por favor, cambie la visibilidad del archivo a Public",
              type: AlertTypes.error,
            });
          } else if (
            String(e).includes(
              "TypeError: Cannot read properties of undefined (reading 'w')"
            )
          ) {
            setAlert({
              text: "Existen campos de metadata vacíos",
              type: AlertTypes.error,
            });
          } else if (String(e).includes("Format")) {
            setAlert({
              text: "Formato incorrecto. Por favor, use la plantilla y el formato correcto de los campos",
              type: AlertTypes.error,
            });
          } else if (
            String(e).includes("split is not a function")
          ) {
            setAlert({
              text: "Formato incorrecto. Por favor, revise el formato del campo IP",
              type: AlertTypes.error,
            });
          }else if (
            String(e).includes(
              "DatesError"
            )
          ) {
            setAlert({
              text: "Las fechas ingresadas no son correctas o su diferencia es mayor a 3 meses",
              type: AlertTypes.error,
            });
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
    setAlert(null);
    setPanetCheck(null);
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const f = files?.item(0);
    if (f) {
      cleaner();
      setFile(f);
    } else {
      cleaner();
    }
  }

  const handleDownloadReporte = (
    panetResponse: {
      equipos: EquipoXLSX[];
      notFound: BodyXLSX;
    },
    rows: BodyXLSX
  ) => {
    const workbook = generateExcel(panetResponse, rows);
    downloadExcel(workbook, "reporte.xlsx");
  };

  const handleCloseModal = () => {
    setModalDataSubmit(false);
  };

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 font-normal">
      <Header title="Importar"></Header>
      <div className="flex flex-col gap-y-2">
        <span className="flex gap-2 items-center text-sm">Para importar un informe use la plantilla adjunta: 
        <a href="/FORMATO DE INFORME AIC BOITC.xlsx" download>
            <button
              className="tooltip btn btn-sm flex items-center self-start shadow-md text-sm"
              data-tip="Descargar plantilla"
            >
              <FontAwesomeIcon
                icon={"file-lines"}
                className="text-slate-800"
              ></FontAwesomeIcon>
            </button>
          </a>
        </span>
        <div className="relative flex flex-row items-end h-12 gap-1">
          <input
            accept=".xls,.xlsx"
            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
            type="file"
            onChange={(e) => handleFile(e)}
          ></input>

          

          {alert && <Alert text={alert.text} type={alert.type}></Alert>}
        </div>
        {file && data.length == 0 && (
          <div className="flex flex-col h-128 justify-center items-center font-bold text-sm text-gray-700">
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
                  <p className="badge badge-lg badge-outline text-sm">
                    {metadata?.informe}
                  </p>
                </span>
                <span className="text-black font-semibold">
                  Emisor:{" "}
                  <p className="badge badge-lg badge-outline text-sm">
                    {metadata?.emisor}
                  </p>
                </span>
                <span className="text-black font-semibold">
                  Fecha de recepción:{" "}
                  <p className="badge badge-lg badge-outline text-sm">
                    {formatDate(metadata?.fecha_recepcion)}
                  </p>
                </span>
                <span className="text-black font-semibold">
                  Fecha de compromiso:{" "}
                  <p className="badge badge-lg badge-outline text-sm">
                    {formatDate(metadata?.fecha_compromiso)}
                  </p>
                </span>
              </div>
              <div className="flex items-end py-2 gap-2 justify-end">
                <button
                  className={`btn btn-sm shadow-md ${
                    isPanetChecking ? "btn-disabled" : " "
                  }`}
                  onClick={async (e) => {
                    e.preventDefault();
                    handlePanetChecking(data);
                    setAlert(null);
                  }}
                >
                  Validar datos
                  {isPanetChecking && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  {!isPanetChecking && (
                    <FontAwesomeIcon icon={"check-to-slot"}></FontAwesomeIcon>
                  )}
                </button>

                {panetCheck &&
                  panetCheck !== null &&
                  panetCheck?.notFound.length !== 0 && (
                    <button
                      className="tooltip btn btn-outline btn-sm btn-error flex shadow-md"
                      data-tip="Descargar reporte"
                      onClick={async (e) => {
                        e.preventDefault();
                        handleDownloadReporte(panetCheck, data);
                        setAlert(null);
                      }}
                    >
                      Reporte
                      <FontAwesomeIcon
                        icon={"exclamation-circle"}
                      ></FontAwesomeIcon>
                    </button>
                  )}
                {panetCheck && (
                  <button
                    className={`tooltip btn btn-sm btn-warning flex shadow-md ${
                      isInformeSubmitting ? "btn-disabled" : " "
                    }  ${panetCheck?.equipos.length !== 0?" ":"btn-disabled"}`}
                    data-tip="En caso de existir, por favor revise el reporte de novedades"
                    onClick={async (e) => {
                      e.preventDefault();
                      //handleDownloadReporte(panetCheck, data);
                      setModalDataSubmit(true);
                      setAlert(null);
                    }}
                  >
                    Cargar datos
                    {isInformeSubmitting && (
                      <span className="loading loading-spinner loading-xs"></span>
                    )}
                    {!isInformeSubmitting && (
                      <FontAwesomeIcon icon={"upload"}></FontAwesomeIcon>
                    )}
                  </button>
                )}

                {modalDataSubmit && panetCheck && (
                  <Modal
                    title="Cargar Informe"
                    text="¿Está seguro de que desea cargar los datos? Recuerde que los equipos incluidos en el reporte de novedades NO serán cargados en el sistema."
                    actionSubmit={() => {
                      setModalDataSubmit(false);
                      setAlert(null);
                      handleSubmitInforme(data as BodyXLSX, panetCheck.equipos);
                    }}
                    icon="info-circle"
                    textButtonAction="Cargar datos"
                    onClose={handleCloseModal}
                  ></Modal>
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
