import { useRouter } from "next/router";
import Header from "../../components/header";
import { ChangeEvent, useEffect, useState } from "react";

import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  calcularRangoFechas,
  downloadExcelInforme,
  estadosVulnerabilidad,
  formatDate,
  getHeaders,
  getHeadersGen,
  getStatsVulnerabilidades,
} from "@/utils/functions";
import Table from "../../components/vulnerability-table";
import {
  deleteInforme,
  getArchivosFromInforme,
  getInforme,
  getInformeVulnerabilidades,
  updateEstadoVulnerabilidad,
  updateInformeCompromiso,
  updateInformeEntrega,
} from "@/utils/postgresql";
import ModalWithChild from "../../components/modal-date";
import Alert, { AlertTypes } from "../../components/alert";
import { addArchivos, getArchivos } from "@/utils/storage";

export default function Informe() {
  const [search, setSearch] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedState, setSelectedState] = useState<string>();
  const [alert, setAlert] = useState<AlertProps | null>();
  const router = useRouter();
  const nombreInforme = router.query.id;
  const [informe, setInforme] = useState<Informe>();
  const [vulnerabilidades, setVulnerabilidades] =
    useState<VulnerabilidadDataTable[]>();
  const [statsVulnerabilidades, setStatsVulnerabilidades] = useState<DataPie>();
  const [tableHeaders, setTableHeaders] = useState<string[]>();
  const [modalDataSubmitCompromiso, setModalDataSubmitCompromiso] =
    useState<boolean>(false);
  const [modalDeleteInforme, setModalDeleteInforme] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [modalFileSubmit, setModalFileSubmit] = useState<boolean>(false);
  const [modalDataSubmitEntrega, setModalDataSubmitEntrega] =
    useState<boolean>(false);
  const [fecha_min, setFechaMin] = useState<string>();
  const [fecha_max, setFechaMax] = useState<string>();
  const [newFechaCompromiso, setNewFechaCompromiso] = useState<string>();
  const toggleEditMode = () => {
    setIsEditable(!isEditable);
  };

  const [fechaEntrega, setFechaEntrega] = useState<string>();
  const [isCompromisoSubmitting, setIsCompromisoSubmitting] = useState(false);
  const [isFileSubmitting, setIsFileSubmitting] = useState(false);
  const [isInformeDeleting, setIsInformeDeleting] = useState(false);
  const [isEntregaSubmitting, setIsEntregaSubmitting] = useState(false);
  const handleSelection = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const [archivos, setArchivos] =
    useState<{ id: string; nombre: string; informe_id: number }[]>();

  const handleAction = () => {
    // Aquí puedes realizar la acción con los registros seleccionados
    console.log("Registros seleccionados:", selectedRows);
    const data = selectedRows.map((id) => {
      return {
        id_informe: informe?.id.toString() || "0",
        id_vulnerabilidad: id.toString(),
        estado: selectedState || "",
      };
    });
    updateEstadoVulnerabilidad("updateEstadoVulnerabilidad", data).then(
      (res) => {
        if (res.message) {
          setAlert({
            text: "Vulnerabilidad actualizada exitosamente",
            type: AlertTypes.success,
          });
          setTimeout(() => {
            router.reload();
          }, 2000);
        } else {
          setAlert({
            text: "Error al actualizar el estado",
            type: AlertTypes.error,
          });
        }
      }
    );
  };

  const handleStateValue = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    setSelectedState(selectedState);
  };

  const handleCloseModalCompromiso = () => {
    setModalDataSubmitCompromiso(false);
  };

  const handleCloseModalDeleteInforme = () => {
    setModalDeleteInforme(false);
    setDeleteConfirmation(false);
  };
  const handleCloseModalEntrega = () => {
    setModalDataSubmitEntrega(false);
  };
  const handleCloseModalFile = () => {
    setModalFileSubmit(false);
    setSelectedFiles(null);
  };
  const handleDeleteInforme = () => {
    setIsInformeDeleting(true);
    deleteInforme({
      id_informe: String(informe?.id),
    }).then((res) => {
      if (res.message) {
        setAlert({
          text: res.message,
          type: AlertTypes.success,
        });
        setTimeout(() => {
          router.reload();
        }, 3000);
      } else {
        setAlert({
          text: "Error al eliminar Informe",
          type: AlertTypes.error,
        });
      }
    });
    setIsInformeDeleting(false);
    setModalDeleteInforme(false);
  };

  const handleSubmitCompromiso = () => {
    setIsCompromisoSubmitting(true);
    updateInformeCompromiso({
      id: String(informe?.id),
      fecha_compromiso: newFechaCompromiso as string,
    }).then((res) => {
      if (res.message) {
        setAlert({
          text: "Nueva fecha de compromiso añadida exitosamente",
          type: AlertTypes.success,
        });
        setTimeout(() => {
          router.reload();
        }, 3000);
      } else {
        setAlert({
          text: "Error al añadir fecha de compromiso",
          type: AlertTypes.error,
        });
      }
    });
    setIsCompromisoSubmitting(false);
    setModalDataSubmitCompromiso(false);
  };

  const handleSubmitEntrega = () => {
    setIsEntregaSubmitting(true);
    updateInformeEntrega({
      id_informe: String(informe?.id),
      fecha_entrega: fechaEntrega as string,
    }).then((res) => {
      if (res.message) {
        setAlert({
          text: "Fecha de entrega añadida exitosamente",
          type: AlertTypes.success,
        });
        setTimeout(() => {
          router.reload();
        }, 3000);
      } else {
        setAlert({
          text: "Error al añadir fecha de entrega",
          type: AlertTypes.error,
        });
      }
    });
    setIsEntregaSubmitting(false);
    setModalDataSubmitEntrega(false);
  };

  const handleSubmitFile = () => {
    if (!selectedFiles) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("file", selectedFiles[i]);
    }

    try {
      console.log(selectedFiles);
      setIsFileSubmitting(true);
      addArchivos(
        String(informe?.id),
        informe?.nombre as string,
        formData
      ).then((response) => {
        if (response.message) {
          console.log("Files uploaded successfully");
          setAlert({
            text: "Archivos añadidos exitosamente",
            type: AlertTypes.success,
          });
          setModalFileSubmit(false);
          setTimeout(() => {
            router.reload();
          }, 3000);
        } else {
          console.error("Upload failed");
          setAlert({
            text: "Error al subir archivos",
            type: AlertTypes.error,
          });
        }
      });
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsFileSubmitting(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  useEffect(() => {
    if (informe) {
      const { fecha_min, fecha_max } = calcularRangoFechas(
        String(informe?.fecha_recepcion),
        String(informe?.fecha_compromiso.at(-1))
      );

      setFechaMin(fecha_min);
      setFechaMax(fecha_max);

      getArchivosFromInforme(String(informe.id)).then((res) => {
        console.log(res);
        setArchivos(res.rows);
      });
    }
  }, [informe]);
  useEffect(() => {
    if (router.isReady) {
      getInforme(nombreInforme as string).then((r) => {
        setInforme(r.rows[0]);
      });

      getInformeVulnerabilidades(nombreInforme as string).then((r) => {
        const vulnerabilidades: VulnerabilidadDataTable[] = (
          r.rows as getInformeVulnerabilidadesResponse[]
        ).map((row): VulnerabilidadDataTable => {
          return {
            id: row.vulnerabilidad_id,
            id_equipo: row.equipo_id,
            id_proactiva: row.id_proactiva,
            hostname: row.hostname,
            ips: row.ips,
            vulnerabilidad: row.vulnerabilidad,
            descripcion: row.descripcion,
            mitigacion_sugerida: row.mitigacion_sugerida,
            observacion: row.observacion,
            estado: row.estado_vulnerabilidad,
          };
        });
        console.log("VULNERABILIDADES: ", vulnerabilidades);
        setVulnerabilidades(vulnerabilidades);
        setStatsVulnerabilidades(getStatsVulnerabilidades(r.rows));
        setTableHeaders(Object.keys(vulnerabilidades[0] || []));
        console.log("HEADERSSSSS::: ", tableHeaders);
      });
    }
  }, [router]);

  if (!nombreInforme || !informe || !archivos || !vulnerabilidades)
    return (
      <div className="flex flex-col border flex-1 justify-center items-center font-bold text-sm text-gray-700">
        <span className="loading loading-bars loading-lg"></span>
        Cargando datos
      </div>
    );
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 font-normal">
      <Header title="Detalles" subtitle={`Informe ${informe.nombre}`}></Header>
      {alert && <Alert text={alert.text} type={alert.type}></Alert>}
      <span className="flex justify-between">
        {modalDeleteInforme && (
          <ModalWithChild
            title="Eliminar Informe"
            text="Se eliminará toda la información relacionada al informe. Esta acción es irreversible."
            icon={["far", "trash-can"]}
          >
            <label className="form-control w-full self-center max-w-xs">
              <div className="label">
                <span className="label-text text-xs">
                  Escribe "eliminar este informe"
                </span>
              </div>
              <input
                type="text"
                className="input input-md input-bordered w-11/12 h-8 self-center mb-2"
                onChange={(e) => {
                  console.log("INPUTTTTT::: ", e.target.value);
                  if (e.target.value !== "eliminar este informe") {
                    setDeleteConfirmation(false);
                  } else setDeleteConfirmation(true);
                }}
              />
            </label>

            <div className="flex flex-row h-auto gap-2 p-3 w-full bg-gray-50 rounded-b-xl justify-end">
              <button
                className="btn btn-outline btn-sm btn-neutral flex shadow-md"
                onClick={handleCloseModalDeleteInforme}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteInforme}
                className="btn btn-sm btn-warning flex shadow-md"
                disabled={deleteConfirmation ? false : true}
              >
                Eliminar
                {isInformeDeleting && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
              </button>
            </div>
          </ModalWithChild>
        )}
        <button
          className="flex btn btn-xs btn-outline w-44 mb-4"
          onClick={() => downloadExcelInforme(informe, vulnerabilidades)}
        >
          Descargar informe completo
        </button>
        <button
          className="flex btn btn-xs btn-warning mb-4 gap-1"
          onClick={() => setModalDeleteInforme(true)}
        >
          <FontAwesomeIcon icon={["far", "trash-can"]}></FontAwesomeIcon>
          Eliminar informe
        </button>
      </span>
      <div className="flex flex-row w-auto gap-2 mb-2">
        <section className="flex flex-col max-w-lg min-w-80 gap-4 shadow-sm border">
          <p className="text-sm text-gray-500 border-b px-1 font-medium ">
            General
          </p>
          <div className="grid grid-cols-2 gap-y-1.5 px-2 items-start font-medium text-sm">
            <p>Estado:</p>
            <p className="badge badge-outline">{informe.estado}</p>
            <p>Emisor:</p>
            <p className="font-normal">{informe.emisor}</p>
            <p>Fecha de recepción:</p>
            <p className="font-normal">{formatDate(informe.fecha_recepcion)}</p>
            <p>Fecha de entrega:</p>
            <p className="flex items-center justify-between font-normal">
              {informe.fecha_entrega ? formatDate(informe.fecha_entrega) : "-"}
              {informe.estado === "Atendido" && !informe.fecha_entrega && (
                <FontAwesomeIcon
                  icon={"edit"}
                  className="text-md hover:cursor-pointer"
                  onClick={() => {
                    setModalDataSubmitEntrega(true);
                    console.log(formatDate(informe.fecha_recepcion));
                  }}
                ></FontAwesomeIcon>
              )}
            </p>
            <p>Equipos:</p>
            <p className="font-semibold ">
              {new Set(vulnerabilidades?.map((obj) => obj["id_equipo"])).size}
            </p>
            {modalDataSubmitEntrega && (
              <ModalWithChild
                title="Fecha de entrega del informe"
                text="Seleccione una fecha. Para entregar el informe debe existir al menos un documento de soporte adjunto. Recuerde que luego de entregar el informe, este no podrá editarse nuevamente."
                icon="paper-plane"
              >
                <input
                  onChange={(e) => {
                    console.log(typeof e.target.value);
                    setFechaEntrega(e.target.value);
                  }}
                  type="date"
                  min={formatDate(informe.fecha_recepcion)}
                  className="badge badge-ghost flex h-6 bg-inherit border self-center mb-4"
                ></input>
                <div className="flex flex-row h-auto gap-2 p-3 w-full bg-gray-50 rounded-b-xl justify-end">
                  <button
                    className="btn btn-outline btn-sm btn-neutral flex shadow-md"
                    onClick={handleCloseModalEntrega}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitEntrega}
                    className="btn btn-sm btn-warning flex shadow-md"
                    disabled={
                      fechaEntrega && archivos.length !== 0 ? false : true
                    }
                  >
                    Entregar Informe
                  </button>
                </div>
              </ModalWithChild>
            )}
          </div>
        </section>

        <section className="flex flex-col max-w-lg min-w-80 gap-4 shadow-sm border">
          <p className="text-sm text-gray-500 border-b px-1 font-medium">
            Histórico de compromiso
          </p>
          <ul className="timeline timeline-vertical">
            {(informe.fecha_compromiso as Date[]).map((date, i) => {
              return (
                <li key={`compromiso-${i}-${date}`}>
                  <hr />
                  <div
                    className={`timeline-start text-sm h-8 mr-2 flex items-center ${
                      informe.fecha_compromiso.at(-1) === date
                        ? "font-semibold"
                        : ""
                    }`}
                  >
                    {formatDate(date)}
                  </div>
                  <div className="timeline-middle">
                    <FontAwesomeIcon
                      icon={`${
                        informe.fecha_compromiso.at(-1) === date
                          ? "calendar-day"
                          : "calendar-xmark"
                      }`}
                      className={`${
                        informe.fecha_compromiso.at(-1) === date
                          ? ""
                          : "text-gray-500"
                      }`}
                    ></FontAwesomeIcon>
                  </div>
                  <hr />
                </li>
              );
            })}
          </ul>

          {!informe.fecha_entrega && (
            <span
              onClick={() => setModalDataSubmitCompromiso(true)}
              className={`flex btn btn-xs btn-outline w-52 self-center ${
                informe.fecha_compromiso.length < 3 ||
                informe.estado !== "Atendido"
                  ? ""
                  : "btn-disabled"
              }`}
            >
              Añadir nuevo compromiso
            </span>
          )}
          {modalDataSubmitCompromiso && (
            <ModalWithChild
              title="Añadir fecha de compromiso"
              text="Seleccione una fecha. Recuerde que el plazo máximo es de 3 meses a partir de la fecha de recepción."
              icon="calendar-day"
            >
              <input
                onChange={(e) => {
                  console.log(typeof e.target.value);
                  setNewFechaCompromiso(e.target.value);
                }}
                type="date"
                min={fecha_min}
                //max={fecha_max} fecha máxima= fecha_recepcion+3 meses
                className="badge badge-ghost flex h-6 bg-inherit border self-center mb-4"
              ></input>
              <div className="flex flex-row h-auto gap-2 p-3 w-full bg-gray-50 rounded-b-xl justify-end">
                <button
                  className="btn btn-outline btn-sm btn-neutral flex shadow-md"
                  onClick={handleCloseModalCompromiso}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitCompromiso}
                  className="btn btn-sm btn-warning flex shadow-md"
                  disabled={newFechaCompromiso ? false : true}
                >
                  Añadir fecha
                  {isCompromisoSubmitting && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                </button>
              </div>
            </ModalWithChild>
          )}
        </section>
        <section className="flex flex-col font-medium shadow-sm border">
          <p className="text-sm text-gray-500 border-b px-1">{`Vulnerabilidades: ${vulnerabilidades?.length}`}</p>

          <PieChart
            series={[
              {
                arcLabel: (item) => `${item.value}`,
                arcLabelMinAngle: 45,
                data: statsVulnerabilidades || [],
                innerRadius: 8,
                outerRadius: 55,
                paddingAngle: 2,
                cornerRadius: 3,
                startAngle: 0,
                endAngle: 360,
                cx: 75,
                cy: 75,
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "white",
                fontWeight: "medium",
                fontSize: "0.75rem",
              },
            }}
            width={400}
            height={200}
          />
        </section>

        <section className="flex flex-col min-w-96 gap-3 shadow-sm border">
          <p className="text-sm text-gray-500 border-b px-1 font-medium">
            Documentos de soporte
          </p>

          <div className="grid grid-cols-1 gap-y-1 px-2.5 text-sm max-w-96 max-h-36 overflow-y-auto">
            {archivos.length === 0 && (
              <p className="text-xs font-semibold place-self-center">
                No hay archivos para mostrar
              </p>
            )}
            {archivos.map((file, i) => {
              return (
                <span
                  key={`file-${file.id}`}
                  className="flex flex-row gap-1.5 items-center border-b overflow-clip whitespace-nowrap hover:bg-gray-100 "
                >
                  <FontAwesomeIcon
                    icon={["far", "file-lines"]}
                    size="lg"
                  ></FontAwesomeIcon>
                  <p>{file.nombre}</p>
                </span>
              );
            })}
          </div>
          <div className="flex justify-end gap-1 px-2">
            {!informe.fecha_entrega && (
              <span
                className="flex btn btn-xs w-32 place-self-end"
                onClick={() => setModalFileSubmit(true)}
              >
                <FontAwesomeIcon icon={"upload"} size="lg"></FontAwesomeIcon>
                Añadir archivos
              </span>
            )}
            <button
              className="flex btn btn-xs btn-outline w-32 place-self-end"
              disabled={archivos.length === 0 ? true : false}
              onClick={() => {
                getArchivos(informe.nombre).then((res) => {
                  console.log(res);
                  const url = window.URL.createObjectURL(res);
                  const link = document.createElement("a");
                  link.href = url;
                  // Setting filename received in response
                  link.setAttribute("download", res.name);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                });
              }}
            >
              <FontAwesomeIcon
                icon={["far", "file-zipper"]}
                size="lg"
              ></FontAwesomeIcon>{" "}
              Descargar .zip
            </button>

            {modalFileSubmit && (
              <ModalWithChild
                title="Cargar Archivos"
                text="Seleccione los archivos de soporte. Extensiones válidas: .xlsx,.xls,.csv,.doc,.docx,.pdf,.txt,.png,.eml,.msg"
                icon="upload"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="file-input file-input-xs place-self-center mb-2"
                  accept=".xlsx,.xls,.csv,.doc,.docx,.pdf,.txt,.png,.eml,.msg"
                ></input>
                <div className="flex flex-row h-auto gap-2 p-3 w-full bg-gray-50 rounded-b-xl justify-end">
                  <button
                    className="btn btn-outline btn-sm btn-neutral flex shadow-md"
                    onClick={handleCloseModalFile}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitFile}
                    className="btn btn-sm btn-warning flex shadow-md"
                    disabled={selectedFiles || !isFileSubmitting ? false : true}
                  >
                    Añadir archivo(s)
                    {isFileSubmitting && (
                      <span className="loading loading-spinner loading-xs"></span>
                    )}
                  </button>
                </div>
              </ModalWithChild>
            )}
          </div>
        </section>
      </div>

      <Header title="Vulnerabilidades"></Header>

      {!informe.fecha_entrega && (
        <div className="flex justify-between py-2">
          <span
            id="toggle_mode"
            className="flex items-center p-1 gap-2 rounded"
          >
            <FontAwesomeIcon
              icon="eye"
              className={`${isEditable ? "text-gray-400" : ""}`}
            ></FontAwesomeIcon>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              onChange={toggleEditMode}
            />
            <FontAwesomeIcon
              icon="pen"
              className={`${isEditable ? "" : "text-gray-400"}`}
            ></FontAwesomeIcon>
          </span>
          {isEditable && (
            <div className="flex gap-2">
              <select
                className="flex select select-bordered select-xs"
                onChange={(e) => handleStateValue(e)}
              >
                <option disabled selected>
                  Seleccione un estado
                </option>
                {estadosVulnerabilidad.map((estado, i) => {
                  return (
                    <option
                      id={`ID-${estado}`}
                      key={`state-${estado}-vulnerabilidad-${i}`}
                    >
                      {estado}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={handleAction}
                className={`btn btn-outline btn-xs ${
                  selectedState && selectedRows.length !== 0
                    ? ""
                    : "btn-disabled"
                }`}
              >
                Actualizar
              </button>
            </div>
          )}
        </div>
      )}

      {
        <div className="flex w-full mb-4">
          <label className="flex items-center gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-full max-w-xs"
              placeholder="Busqueda"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target?.value)
              }
            />
            <FontAwesomeIcon icon={"search"}></FontAwesomeIcon>
          </label>
        </div>
      }

      {/*vulnerabilidades && tableHeaders && (
        <Table
          size="small"
          data={
            (vulnerabilidades as VulnerabilidadDataTable[])
          }
          header={tableHeaders as string[]}
          editable={isEditable}
          onSelect={handleSelection}
          routable_rows="vulnerability/"
        ></Table>
      )*/}
      {vulnerabilidades && tableHeaders && (
        <Table
          size="small"
          data={
            (vulnerabilidades as VulnerabilidadDataTable[]).filter(
              (e: Object) =>
                e &&
                Object.values(e)
                  .join()
                  .toLowerCase()
                  .includes((search && search.toLowerCase()) || "")
            ) || []
          }
          header={tableHeaders as string[]}
          editable={isEditable}
          onSelect={handleSelection}
          routable_rows="vulnerability/"
        ></Table>
      )}
    </main>
  );
}
