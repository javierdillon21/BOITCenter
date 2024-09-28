import {
  filterPcListIps,
  findMatchingObjects,
  getValidIPs,
  processRows,
} from "@/utils/functions";
import { NextApiRequest, NextApiResponse } from "next";
import { fileURLToPath } from "url";

//MANEJO DE CONSULTAS A PROACTIVANET

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqZGlsbG9uIiwib3ZyIjoiZmFsc2UiLCJuYmYiOjE3MjY3ODUzMTIsImV4cCI6MTc1ODMyMTMxMiwiaWF0IjoxNzI2Nzg1MzEyLCJpc3MiOiJwcm9hY3RpdmFuZXQiLCJhdWQiOiJhcGkifQ.g78AVbXLmqpAYw6ZgQ6ETs-xTqJ5teTnLmh4hi0iw8E";
  console.log("rer.query: ", request.query);

  if (request.method === "GET") {
    //const id = request.query.id;
    switch (request.query.req) {
      case "listPcs":
        const listPcsResponse = await fetch(
          "http://10.191.204.61/proactivanet/api/Pcs?$fields=ListIPs",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: token,
              "Accept-Language": "es",
            },
          }
        );
        if (listPcsResponse.ok) {
          const data: PcListIp = await listPcsResponse.json();
          const ip = "10.32.112.107";
          const equipos = data.map((equipo) => {
            if (equipo.ListIPs) {
              const ips = getValidIPs(equipo.ListIPs);
              return { Id: equipo.Id, ListIPs: ips };
            } else return equipo;
          });

          response.status(200).json(equipos);
        }

        console.log("RESPUESTA", listPcsResponse);

        break;
      case "listPcsRaw":
        const listPcsRawResponse = await fetch(
          "http://10.191.204.61/proactivanet/api/Pcs",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: token,
              "Accept-Language": "es",
            },
          }
        );
        if (listPcsRawResponse.ok) {
          const data = await listPcsRawResponse.json();
          response.status(200).json(data);
        }

        console.log("RESPUESTA", listPcsRawResponse);

        break;
      case "listPcsIP":
        const listPcsIPResponse = await fetch(
          "http://10.191.204.61/proactivanet/api/Pcs?$fields=ListIPs",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: token,
              "Accept-Language": "es",
            },
          }
        );
        if (listPcsIPResponse.ok) {
          const data = await listPcsIPResponse.json();
          response.status(200).json(data);
        }

        console.log("RESPUESTA", listPcsIPResponse);
        break;

      default:
        break;
    }
  } else if (request.method === "POST") {
    //
    switch (request.query.req) {
      case "listPcs":
        const listPcsResponse = await fetch(
          "http://10.191.204.61/proactivanet/api/Pcs?$fields=ListIPs",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: token,
              "Accept-Language": "es",
            },
          }
        );
        if (listPcsResponse.ok) {
          const data: PcListIp = await listPcsResponse.json();
          const rowsXLSX: BodyXLSX = request.body;
          const dataPanet: PcListIps = data.map((equipo) => {
            if (equipo.ListIPs) {
              const ips = getValidIPs(equipo.ListIPs);
              return { Id: equipo.Id, ListIPs: ips };
            } else return { Id: equipo.Id, ListIPs: "0.0.0.0" };
          });

          const result = await processRows(rowsXLSX, dataPanet, token)
          if (result) response.status(200).json(result);
         
        }
        break;

      default:
        break;
    }
  }
}
