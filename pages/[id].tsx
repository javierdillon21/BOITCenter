import { useRouter } from "next/router";
import Header from "../components/header";

export default function Registro() {
  const router = useRouter();
  router.query.id;

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 font-normal">
      <Header
        title="Detalles"
        subtitle={`Registro ${router.query.id}`}
      ></Header>

      <div className="grid grid-cols-2 w-3/4">
        <section>
          <p className="font-light text-xs md:text-lg text-gray-500">General</p>
          <div className="grid grid-cols-2">
            <p>hostname:</p>
            <p>{3446}</p>
            <p>ip:</p>
            <p>{3446}</p>
            <p>puerto:</p>
            <p>{3446}</p>
            <p>area:</p>
            <p>{3446}</p>
            <p>proyecto:</p>
            <p>{3446}</p>
          </div>
          <div className="divider"></div>
          <p className="font-light text-xs md:text-lg text-gray-500">Informe</p>
          <div className="grid grid-cols-2">
            <p>alertas:</p>
            <p>{3446}</p>
            <p>estado:</p>
            <p>{3446}</p>
            <p>observacion estado:</p>
            <p>{3446}</p>
            <p>observacion informe:</p>
            <p>{3446}</p>
          </div>
        </section>

        <section>
          <p className="font-light text-xs md:text-lg text-gray-500">Fechas</p>
          <div className="grid grid-cols-2">
            <p>fecha recepcion:</p>
            <p>{3446}</p>
            <p>fecha entrega:</p>
            <p>{3446}</p>
          </div>
          <div className="divider"></div>
          <div>4</div>
        </section>
      </div>
    </main>
  );
}
