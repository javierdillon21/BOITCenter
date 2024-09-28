import Image from "next/image";
import Table from "../../components/table";
import { reg } from "@/app/datosprueba";
import { useEffect, useState } from "react";
import { getData } from "@/utils/functions";

export default function Search() {
  const [search, setSearch] = useState("");
  const registros = reg;
  const [informes, setInformes] = useState([]);
  useEffect(() => {
    getData({ id: "all", type: "listInforme" }).then((data: Response) => {
      console.log(data)
      setInformes(data.items);
      // const arr = data.items.map((e: any) => {
      //   return e[1]; // TODO: crear types
      // });
      // setYears(Array.from(new Set(arr)));
    });
  }, []);

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">
        <h1 className="font-semibold text-lg md:text-2xl">
          Todos los Informes
        </h1>
      </div>
      <div className="w-full mb-4">
        <label className="input input-bordered flex items-center w-96">
          <input
            type="text"
            className="grow"
            placeholder="Busqueda"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target?.value)
            }
          />
        </label>
        {/* <Search value={searchParams.q} /> */}
      </div>
      <Table
        size="normal"
        header={[
          "ID",
          "Fecha recepcion",
          "Fecha entrega",
          "Hostname",
          "Direccion IP",
          "Area",
          "Proyecto",
          "Alertas",
          "Puerto",
          "Estado",
          "Observacion estado",
          "Observacion informe",
        ]}
        data={registros.filter(
          (e: Object) =>
            e &&
            Object.values(e)
              .join()
              .toLowerCase()
              .includes((search && search.toLowerCase()) || "")
        )}
      ></Table>
      {/* <UsersTable users={users} offset={newOffset} /> */}
    </main>
  );
}
