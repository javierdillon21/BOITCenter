import { useEffect, useState } from "react";
import Header from "../components/header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  listEquipo,
  listRecord,
  listVulnerabilidadesEstado,
} from "@/utils/postgresql";
import Link from "next/link";

export default function Home() {
  const [search, setSearch] = useState("");
  const [equipos, setEquipos] = useState();
  const [vulnerabilidades, setVulnerabilidades] = useState<
    {
      informe_id: string;
      vulnerabilidad_id: string;
      estado: string;
      observacion: string;
    }[]
  >();
  const [vMitigadas, setVMitigadas] = useState<number>();
  const [vNoMitigadas, setVNoMitigadas] = useState<number>();
  const [informes, setInformes] = useState<Informe[]>();
  const [informesEntregados, setInformesEntregados] = useState<number>();

  useEffect(() => {
    if (vulnerabilidades) {
      const mitigadas = vulnerabilidades.reduce((acc, vulnerabilidad) => {
        return vulnerabilidad.estado === "Mitigada" ? acc + 1 : acc;
      }, 0);
      setVMitigadas(mitigadas);

      const noMitigadas = vulnerabilidades.reduce((acc, vulnerabilidad) => {
        return vulnerabilidad.estado === "No mitigada" ? acc + 1 : acc;
      }, 0);
      setVNoMitigadas(noMitigadas);
    }
  }, [vulnerabilidades]);

  useEffect(() => {
    if (informes) {
      const entregados = informes.reduce((acc, informe) => {
        return informe.estado === "Entregado" ? acc + 1 : acc;
      }, 0);
      setInformesEntregados(entregados);
    }
  }, [informes]);

  useEffect(() => {
    listEquipo().then((res) => {
      setEquipos(res.data);
    });
    listVulnerabilidadesEstado().then((res) => {
      setVulnerabilidades(res.data);
    });
    listRecord("listInforme").then((res) => {
      setInformes(res.rows);
    });
  }, []);

  if (
    !equipos ||
    !vulnerabilidades ||
    !vMitigadas ||
    !vNoMitigadas ||
    !informes ||
    !informesEntregados
  )
    return (
      <div className="flex flex-col border flex-1 justify-center items-center font-bold text-sm text-gray-700">
        <span className="loading loading-bars loading-lg"></span>
        Cargando datos
      </div>
    );
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <Header title="Bitácora"></Header>
      <section className="flex min-w-1/2 max-w-4xl">
        <div className="stats shadow w-full rounded-lg">
          <Link href={"/report"}>
            <div className="stat">
              <div className="stat-figure text-primary">
                <FontAwesomeIcon
                  icon={"computer"}
                  className="text-4xl"
                ></FontAwesomeIcon>
              </div>
              <div className="stat-title">Equipos registrados</div>
              <div className="stat-value text-primary">
                {(equipos as []).length}
              </div>
            </div>
          </Link>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <FontAwesomeIcon
                icon={"bug-slash"}
                className="text-4xl"
              ></FontAwesomeIcon>
            </div>
            <div className="stat-value">{`${Math.round(
              (vMitigadas * 100) / vulnerabilidades.length
            )}%`}</div>
            <div className="stat-title">Vulnerabilidades mitigadas</div>
            <div className="stat-desc text-secondary">{`de ${vulnerabilidades.length} en total`}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <FontAwesomeIcon
                icon={"file-contract"}
                className="text-4xl"
              ></FontAwesomeIcon>
            </div>
            <div className="stat-value">{`${Math.round(
              (informesEntregados * 100) / informes.length
            )}%`}</div>
            <div className="stat-title">Informes entregados</div>
            <div className="stat-desc text-secondary">{`${
              informes.length - informesEntregados
            } pendientes`}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
