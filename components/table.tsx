import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Table(props: {
  header: string[];
  data: Object[]; //| {}[];
  routable_rows?: string;
  size: 'small' | 'normal' 
}) {
  //const tableHeaders: string[] = props.header || Object.keys(props.data[0]);
  //const tableHeaders: string[] = props.header
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
      <div className="flex overflow-auto h-128">
        <table className={`table ${props.size === "small"?"table-xs": " "} table-pin-rows`}>
          <thead>
            <tr className="bg-gray-100 h-12">
              {props.header.map((h, i) => {
                return <th key={`head-${h}-col-${i}`}>{h}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {props.data //token !== 0 ? token - 1 :
              .slice(token, token + steps)
              .map((reg, i) => {
                return (
                  <tr
                    className="hover"
                    key={`key-${i}`}
                    onClick={() => {
                      if (props.routable_rows) {
                        router.push(
                          `${props.routable_rows}${Object.values(reg)[0]}`
                        );
                      }
                    }}
                  >
                    {Object.values(reg).map((k, i) => {
                      if (typeof k.getMonth === "function") {
                        return (
                          <th key={`keyrow-${i}`}>
                            {k.toLocaleDateString("en-GB")}
                          </th>
                        );
                      } else return <th key={`keyrow-${i}`}>{k}</th>;
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
          <p className="flex text-gray-600 ml-4">
            Mostrando {steps} de {nreg} resultados por página
          </p>
        )}
        {nreg === 0 && (
          <p className="flex text-gray-600 ml-4">
            No hay resultados para mostrar
          </p>
        )}
      </div>
    </div>
  );
}
