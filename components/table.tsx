import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Table(props: {
  header: string[];
  data: Object[]; //| {}[];
  routable_rows?: string;
  size: "small" | "normal";
  idColum?: number | 0;
}) {
  console.log("ROUTABLE ROWS:: ", props.routable_rows);
  const router = useRouter();
  const steps = 30;
  const nreg = props.data.length;
  const ntabs = Number.isInteger(nreg / steps)
    ? nreg / steps
    : Math.floor(nreg / steps) + 1;

  const [token, setToken] = useState<number>(1);
  const [currentTab, setCurrentTab] = useState<number>(1);
  useEffect(() => {
    console.log("tag:", currentTab);
    console.log("prevtoken:", token);
    const nextToken =
      steps * currentTab - steps < 0 ? 0 : steps * currentTab - steps;
    setToken(nextToken);
    console.log("currenttoken:", nextToken);
  }, [currentTab]);

  return (
    <div className="flex flex-col mx-4 gap-y-4">
      <div className="flex ">
        <table
          className={`table-fixed ${
            props.size === "small" ? "table-xs" : " "
          } table-pin-rows`}
        >
          <thead>
            <tr className="bg-gray-100 border-b-2">
              {props.header.map((h, i) => {
                if (!h.includes("id_") && h !== "id")
                  return (
                    <th
                      key={`head-${h}-col-${i}`}
                      className="text-sm font-semibold w-72 text-start"
                    >
                      {h}
                    </th>
                  );
              })}
            </tr>
          </thead>
          <tbody>
            {props.data //token !== 0 ? token - 1 :
              .slice(token, token + steps)
              .map((reg, i) => {
                return (
                  <tr
                    className={`hover:bg-gray-100 border-b ${
                      props.routable_rows ? "hover:cursor-pointer" : ""
                    }`}
                    key={`key-${i}`}
                    onClick={() => {
                      if (props.routable_rows) {
                        router.push(
                          `${props.routable_rows}${
                            Object.values(reg)[props.idColum || 0]
                          }`
                        );
                      }
                    }}
                  >
                    {Object.values(reg).map((k, i) => {
                      const header = Object.keys(reg)[i];
                      if (!header.includes("id_") && header !== "id") {
                        if (Array.isArray(k)) {
                          return (
                            <td
                              key={`keyrow-${i}`}
                              className="max-w-96 overflow-hidden text-ellipsis max-h-16 h-10"
                            >
                              <span className="flex flex-col">
                                {k.map((item, i) => {
                                  return <p key={`item-${i}`}>{item}</p>;
                                })}
                              </span>
                            </td>
                          );
                        } else
                          return (
                            <td
                              key={`keyrow-${i}`}
                              className="max-w-96 overflow-hidden text-ellipsis max-h-16 h-10"
                            >
                              {header.includes("estado") ? (
                                <span className="flex justify-center p-0.5 min-w-20 items-center border border-black rounded-badge mt-2 ml-2 font-medium">
                                  {k ? k : "-"}
                                </span>
                              ) : k ? (
                                k
                              ) : (
                                "-"
                              )}
                            </td>
                          );
                      }
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className={`join ${nreg === 0 ? "justify-center" : "items-center"}`}>
        {nreg !== 0 &&
          nreg > steps &&
          new Array(ntabs).fill(0).map((o, i) => {
            return (
              <button
                key={`tab-${i + 1}-steps-${steps}`}
                className={`join-item btn btn-md ${
                  currentTab === i + 1 ? "btn-active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentTab(i + 1);
                }}
              >
                {i + 1}
              </button>
            );
          })}
        {/* <button className="join-item btn btn-md btn-active">2</button> */}
        {nreg !== 0 && (
          <span className="flex flex-col text-gray-600 ml-2 text-xs italic">
            <p className="font-semibold not-italic">
              Resultados encontrados: {nreg}
            </p>
            <p> Mostrando {steps} resultados por página</p>
          </span>
        )}
        {nreg === 0 && (
          <p className="flex text-gray-600 ml-4 text-sm">
            No hay resultados para mostrar
          </p>
        )}
      </div>
    </div>
  );
}
