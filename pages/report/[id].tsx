import { useRouter } from "next/router";
import Header from "../../components/header";
import { useState } from "react";
import { getData } from "@/utils/functions";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Registro() {
  const router = useRouter();
  router.query.id;
  const [res, setRes] = useState("");

  getData({ type: "listInforme", id: "all" }).then((data) => {
    console.log(JSON.stringify(data));
    setRes(JSON.stringify(data));
  });

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 font-normal">
      <Header title="Detalles" subtitle={`Informe ${router.query.id}`}></Header>

      <div className="flex flex-row w-auto h-64">
        <section className="flex flex-col max-w-lg min-w-96 gap-4">
          <p className="text-xs md:text-lg text-gray-500">General</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 items-start">
            <p className="font-bold">Estado:</p>
            <p className="badge badge-outline">{"EN PROCESO"}</p>
            <p className="font-bold">Fecha de recepción:</p>
            <p>{"02/07/2024"}</p>
            <p className="font-bold">Fecha de compromiso:</p>
            <p>{"02/07/2024"}</p>
            <p className="font-bold">Fecha de entrega:</p>
            <p>{"02/07/2024"}</p>
            <p className="font-bold">Adjuntos:</p>
            {/* <FontAwesomeIcon icon={"m"}></FontAwesomeIcon> */}
          </div>
        </section>
        <div className="divider divider-horizontal"></div>
        <section className="flex flex-col ">
          <p className="text-xs md:text-lg text-gray-500">Alertas</p>

          <PieChart
            series={[
              {
                arcLabel: (item) => `${item.value}`,
                arcLabelMinAngle: 45,
                data: [
                  { id: 0, value: 10, label: "Pendientes", color: "orange" },
                  { id: 1, value: 15, label: "Mitigadas", color: "green" },
                  { id: 2, value: 20, label: "No mitigadas", color: "black" },
                  {
                    id: 3,
                    value: 20,
                    label: "En espera de autorización",
                    color: "gray",
                  },
                ],
                innerRadius: 30,
                outerRadius: 85,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: 0,
                endAngle: 360,
                cx: 100,
                cy: 75,
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "white",
                fontWeight: "bold",
              },
            }}
            width={450}
            height={150}
          />
        </section>
        <div className="divider divider-horizontal"></div>
        <section className="flex flex-col gap-4">
          <p className="text-xs md:text-lg text-gray-500">Observaciones</p>
          <p className="flex">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>
        </section>
      </div>
      <div className="divider"></div>
    </main>
  );
}
