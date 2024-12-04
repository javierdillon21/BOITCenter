import Header from "../../components/header";
import { useEffect, useState } from "react";
import Table from "../../components/table";
import { listEquipo } from "@/utils/postgresql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Equipos() {
  const [search, setSearch] = useState("");
  const [equipos, setEquipos] = useState();

  useEffect(() => {
    listEquipo().then((res) => {
      
      setEquipos(res.data);
    });
  }, []);

  if (!equipos)
    return (
      <div className="flex flex-col border flex-1 justify-center items-center font-bold text-sm text-gray-700">
        <span className="loading loading-bars loading-lg"></span>
        Cargando datos
      </div>
    );

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <Header title="Todos los Equipos" subtitle={`Registrados: ${(equipos as []).length}`} italicSubtitle={true}></Header>
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
        data={(equipos as []).filter(
          (e: Object) =>
            e &&
            Object.values(e)
              .join()
              .toLowerCase()
              .includes((search && search.toLowerCase()) || "")
        ) || []}
        header={Object.keys(equipos[0] || [])}
        size="small"
        routable_rows="hardware/"
      ></Table>
    </main>
  );
}
