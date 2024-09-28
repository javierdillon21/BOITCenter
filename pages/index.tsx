"use client";
import Image from "next/image";
import Table from "../components/table";
import { reg } from "@/app/datosprueba";
import { useState } from "react";
import Header from "../components/header";
//import { GetServerSideProps, InferGetServerSidePropsType } from "next";

/*export const getServerSideProps = (async () => {
  const response = await fetch(
    "http://10.191.204.61/proactivanet/api/Pcs?Hostname=DevProjects",
    {
      method: "GET",
      
      headers: {
        Accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqZGlsbG9uIiwib3ZyIjoiZmFsc2UiLCJuYmYiOjE3MjY3ODUzMTIsImV4cCI6MTc1ODMyMTMxMiwiaWF0IjoxNzI2Nzg1MzEyLCJpc3MiOiJwcm9hY3RpdmFuZXQiLCJhdWQiOiJhcGkifQ.g78AVbXLmqpAYw6ZgQ6ETs-xTqJ5teTnLmh4hi0iw8E",
        "Accept-Language": "es",
      },
    }
  );
  const data: GetPcResponseBody = await response.json();
  return { props: { data } };
}) satisfies GetServerSideProps<{ data: GetPcResponseBody }>;*/

export default function Home() {
  const [search, setSearch] = useState("");
  const registros = reg;

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <Header title="Bitácora"></Header>
      <div className="w-full mb-4">
        <label className="input input-md input-bordered flex items-center w-96">
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
