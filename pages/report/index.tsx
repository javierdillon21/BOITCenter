import Table from "../../components/table";
import { useEffect, useState } from "react";
import { formatDate, getHeaders } from "@/utils/functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { listRecord } from "@/utils/postgresql";
import Header from "../../components/header";

export default function Informes() {
  const [search, setSearch] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [informes, setInformes] = useState<Informe[]>();
  useEffect(() => {
    listRecord("listInforme").then((res) => {
      const rows: Informe[] = res.rows;
      const result: Informe[] = rows.map((informe, index) => {
        return {
          id: informe.id,
          nombre: informe.nombre,
          emisor: informe.emisor,
          fecha_recepcion: formatDate(informe.fecha_recepcion),
          fecha_compromiso: formatDate(informe.fecha_compromiso.at(-1)),
          fecha_entrega: formatDate(informe.fecha_entrega),
          estado: informe.estado
        };
      });

      setInformes(result);
      setHeaders(Object.keys(res.rows[0]));
    });
  }, []);
  if (!informes)
    return (
      <div className="flex flex-col flex-1 justify-center items-center font-bold text-sm text-gray-700">
        <span className="loading loading-bars loading-lg"></span>
        Cargando datos
      </div>
    );
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <Header
        title="Todos los Informes"
        subtitle={`Registrados: ${informes.length}`}
        italicSubtitle={true}
      ></Header>
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
        {/* <Search value={searchParams.q} /> */}
      </div>
      <Table
        size="small"
        header={headers}
        routable_rows="report/"
        idColum={1}
        data={
          informes.filter(
            (e: Object) =>
              e &&
              Object.values(e)
                .join()
                .toLowerCase()
                .includes((search && search.toLowerCase()) || "")
          ) || []
        }
      ></Table>
      {/* <UsersTable users={users} offset={newOffset} /> */}
    </main>
  );
}
