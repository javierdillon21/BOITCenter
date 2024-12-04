import { NextApiRequest, NextApiResponse } from "next";

import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "admint",
  password: "tBpA/-12*03P",
  database: "bd_inventory",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function executeQuery(query: string, inputValues: InputValues) {
  const values = Object.values(inputValues);
  try {
    const res = await pool.query(query, values);
    return res.rows;
  } catch (err) {
    console.error("Error ejecutando la consulta:", err);
    throw err;
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log("request.query: ", request.query);
  const client = await pool.connect();

  if (request.method === "GET") {
    const { req } = request.query;

    switch (req) {
      case "getVulnerabilidadFromInforme":
        const { id_vulnerabilidad } = request.query;
        console.log("id-v: ", id_vulnerabilidad);
        try {
          const query =
            "select iv.informe_id as id_informe,ev.equipo_id as id_equipo,i.estado as informe_estado, v.id, e.hostname as equipo, iv.estado, v.nombre, v.descripcion, v.cve, v.mitigacion_sugerida, v.referencia, iv.observacion from inventory.informe_vulnerabilidad as iv JOIN inventory.vulnerabilidad as v ON iv.vulnerabilidad_id= v.id JOIN inventory.equipo_vulnerabilidad as ev ON v.id= ev.vulnerabilidad_id JOIN inventory.equipo as e ON ev.equipo_id= e.id JOIN inventory.informe as i ON iv.informe_id=i.id where v.id=$1";
          const result = await pool.query(query, [id_vulnerabilidad]);
          response.status(200).json({ data: result.rows[0] });
        } catch (error) {
          response
            .status(500)
            .json({ error: "Error al listar vulnerabilidad" });
          console.log(error);
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      case "listVulnerabilidadesEstado":
        try {
          const query =
            "select * from inventory.informe_vulnerabilidad";
          const result = await pool.query(query);
          response.status(200).json({ data: result.rows });
        } catch (error) {
          response
            .status(500)
            .json({ error: "Error al listar vulnerabilidades" });
          console.log(error);
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;

      default:
        response.status(400).json({ error: "Solicitud no válida" });
        break;
    }
  } else if (request.method === "POST") {
    const { req, data } = request.body as {
      req: RequestType;
      data: InputValues;
    };

    switch (req) {
      case "updateEstadoVulnerabilidad":
        try {
          await client.query("BEGIN");

          for (const vulnerabilidad of data as updateEstadoVulnerabilidadInput) {
            const query =
              "UPDATE inventory.informe_vulnerabilidad SET estado=$3 WHERE informe_id=$1 and vulnerabilidad_id=$2 RETURNING estado";
            await executeQuery(query, vulnerabilidad);
          }
          await client.query("COMMIT");
          response.status(200).json({
            message: `Actualización exitosa`,
          });
        } catch (error) {
          await client.query("ROLLBACK");
          response.status(500).json({ error: "Error actualizando estado" });
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      case "updatePropsVulnerabilidad":
        try {
          /*const query =
            "WITH update_vulnerabilidad AS (UPDATE inventory.vulnerabilidad SET observacion = $4 WHERE id = $2 RETURNING observacion), update_informe_vulnerabilidad AS (UPDATE inventory.informe_vulnerabilidad SET estado = $3 WHERE informe_id = $1 AND vulnerabilidad_id = $2 RETURNING estado) SELECT (SELECT observacion FROM update_vulnerabilidad) AS observacion,(SELECT estado FROM update_informe_vulnerabilidad) AS estado;";
          console.log(data);*/
          const query =
            "UPDATE inventory.informe_vulnerabilidad SET estado= $3, observacion=$4 WHERE informe_id = $2 AND vulnerabilidad_id = $1";
          console.log("data: ", data);
          /*const queryIV =
            "UPDATE inventory.informe_vulnerabilidad SET estado=$3 WHERE informe_id=$1 and vulnerabilidad_id=$2 RETURNING estado";
          const resultIV = await executeQuery(queryIV, data);
          const queryV =
          "UPDATE inventory.vulnerabilidad SET observacion=$4 WHERE vulnerabilidad_id=$2 RETURNING observacion";
          const resultV = await executeQuery(queryIV, data);*/
          const result = await executeQuery(query, data);
          response
            .status(200)
            .json({ message: "Actualizacion realizada correctamente", result });
        } catch (error) {
          console.log(error);
          response.status(500).json({ error: "Error actualizando campos" });
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      default:
        response.status(400).json({ error: "Solicitud no válida" });
        break;
    }
  } else {
    response.status(405).json({ error: "Método no permitido" });
  }
}
