import { getValidIPs } from "@/utils/functions";
import { processRows } from "@/utils/panet";
import { NextApiRequest, NextApiResponse } from "next";

//MANEJO DE CONSULTAS A PROACTIVANET

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQUk9BQ1RJVkFORVRcXEFkbWluaXN0cmF0b3IiLCJvdnIiOiJmYWxzZSIsImF1dCI6IjAiLCJuYmYiOjE3MzMzMjYyNDcsImV4cCI6MTc2NDg2MjI0NywiaWF0IjoxNzMzMzI2MjQ3LCJpc3MiOiJwcm9hY3RpdmFuZXQiLCJhdWQiOiJhcGkifQ.W36oOHyq9xkYW3WVAVpctnC3VTx8cOYgHnvbmeVOBE4";
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
        console.log(listPcsResponse);
        if (listPcsResponse.ok) {
          const data: PcListIp = await listPcsResponse.json();

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

          const result = await processRows(rowsXLSX, dataPanet, token);

          if (result) {
            response.status(200).json(result);
          } 
        }else {
          response
            .status(listPcsResponse.status)
            .json({ error: "Error fetching listPcs" });
        }
        break;

      default:
        break;
    }
  }
}
