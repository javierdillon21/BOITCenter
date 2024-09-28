
import DBconnection from "@/utils/postgresql";
import { NextApiRequest, NextApiResponse } from "next";
import { Connection } from "postgresql-client";


 ///home/admincor/.config/code-server/config.yaml
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log("rer.query: ", request.query);

  if (request.method === "GET") {
    const id = request.query.id;
    switch (request.query.req) {
      case "listInforme":
        console.log("listando informes todos");
        const listInformeResult = await DBconnection(
          `select * from "InitialTables"."Informe" ${
            id === "all" ? "" : `where "Nombre"= '${id}'`
          }`
        );
        if (listInformeResult?.rows) {
          const items: Informe[] = listInformeResult.rows.map((row, i) => {
            return { id: row[0], año: row[1], descripcion: row[2] };
          });
          response
            .status(200)
            .json(<APIResponse>{ items: items, query: request.query.id });
        }
        // response.status(200).json({
        //   fields: listInformeResult?.fields,
        //   items: listInformeResult?.rows,
        // });
        break;
      case "listRegistro":
        const listRegistroResult = await DBconnection("");
        response.status(200).json({
          items: listRegistroResult,
        });
        break;
      default:
        break;
    }
  } else if (request.method === "POST") {
    //
  }
}
