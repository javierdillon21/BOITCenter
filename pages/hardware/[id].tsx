import Header from "../../components/header";
import { useEffect, useState } from "react";
import { getEquipo, getEquipoVulnerabilidades } from "@/utils/postgresql";
import Table from "../../components/table";
import XLSX from "xlsx";
import { useRouter } from "next/router";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import {
  downloadExcel,
  generarExcelHistoricoVulnerabilidades,
  getStatsVulnerabilidades,
} from "@/utils/functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Equipos() {
  const [search, setSearch] = useState("");
  const [equipo, setEquipo] = useState<Equipo>();
  const [equipoVulnerabilidades, setEquipoVulnerabilidades] =
    useState<EquipoVulnerabilidadesResult[]>();
  const [statsVulnerabilidades, setStatsVulnerabilidades] = useState<DataPie>();

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      const idEquipo = router.query.id;
      getEquipo(idEquipo as string).then((res) => {
        setEquipo(res.data[0]);
      });
      getEquipoVulnerabilidades(idEquipo as string).then((res) => {
        const equipoVulnerabilidades: EquipoVulnerabilidadesResult[] =
          res.data.map((v: EquipoVulnerabilidadesResult) => {
            return {
              informe: v.informe,
              vulnerabilidad: v.vulnerabilidad,
              descripcion: v.descripcion,
              cve: v.cve,
              mitigacion_sugerida: v.mitigacion_sugerida,
              referencia: v.referencia,
              observacion: v.observacion,
              estado: v.estado,
            };
          });
        setEquipoVulnerabilidades(equipoVulnerabilidades);
        setStatsVulnerabilidades(getStatsVulnerabilidades(res.data));
      });
    }
  }, [router]);

  const handleDownloadHistorico = () => {
    // Crear un libro de trabajo y añadir la hoja de cálculo
    const workbook = generarExcelHistoricoVulnerabilidades(equipo as Equipo, equipoVulnerabilidades as EquipoVulnerabilidadesResult[]);
    downloadExcel(workbook, `HistóricoVulnerabilidades-${equipo?.hostname}.xlsx`);
  };

  // console.log("equiposvulnerabildieas::: ", equipoVulnerabilidades)
  if (!equipo || !equipoVulnerabilidades)
    return (
      <div className="flex flex-col border flex-1 justify-center items-center font-bold text-sm text-gray-700">
        <span className="loading loading-bars loading-lg"></span>
        Cargando datos
      </div>
    );

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <Header title="Equipo"></Header>
      <section className="flex w-full p-4 mb-6 gap-x-4 border">
        <div className="grid grid-cols-[200px_1fr] p-3 gap-y-2 self-start gap-x-0 border text-sm max-w-3/4 min-w-96 shadow-sm rounded">
          <p>Hostname</p>
          <p className="font-medium">{equipo.hostname || "-"}</p>
          <p>IP(s)</p>
          <span className="font-medium">
            {equipo.ips.map((ip, i) => {
              return <p key={`ip-${i}`}>{ip}</p>;
            })}
          </span>
          <p>Descripción</p>
          <p className="font-medium">{equipo.descripcion || "-"}</p>
          <p>Localización</p>
          <p className="font-medium">{equipo.localizacion || "-"}</p>
          <p>Responsable BOITC</p>
          <p className="font-medium">{equipo.responsable_boitc || "-"}</p>
          <p>Responsable del servicio</p>
          <p className="font-medium">{equipo.responsable_servicio || "-"}</p>
          <p>Clasificaciones</p>
          <p className="font-medium">{equipo.clasificaciones || "-"}</p>
          <p>Sistema operativo</p>
          <p className=" font-medium">{equipo.sistema_operativo || "-"}</p>
          <p>Tipo</p>
          <p className="font-medium">{equipo.tipo || "-"}</p>
        </div>
        <div className="flex max-w-96">
          {/*<PieChart
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
          />*/}
        </div>
      </section>
      <Header
        title="Histórico de Vulnerabilidades"
        subtitle={`Registradas: ${equipoVulnerabilidades.length}`}
        italicSubtitle={true}
      ></Header>
      <div className="flex w-full mb-4 justify-between">
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
        {/* <Search value={searchParams.q} /> */}
        <button
          className="flex btn btn-sm btn-outline place-self-end"
          onClick={handleDownloadHistorico}
        >
          <FontAwesomeIcon icon={["far","file-excel"]} size="lg"></FontAwesomeIcon>{" "}
          Descargar histórico
        </button>
      </div>
      <Table
        data={
          equipoVulnerabilidades.filter(
            (e: Object) =>
              e &&
              Object.values(e)
                .join()
                .toLowerCase()
                .includes((search && search.toLowerCase()) || "")
          ) || []
        }
        header={Object.keys(equipoVulnerabilidades[0]||[])}
        size="small"
      ></Table>
    </main>
  );
}
