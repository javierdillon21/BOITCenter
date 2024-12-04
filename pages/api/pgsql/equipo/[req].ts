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
    const id = request.query.id;
    switch (req) {
      case "listEquipo":
        try {
          const query =
            "select id, hostname, ips, descripcion, tipo, sistema_operativo, responsable_servicio from inventory.equipo";
          const result = await pool.query(query);
          console.log("RESPUESTA: ", result.rows);
          response.status(200).json({ data: result.rows });
        } catch (error) {
          response.status(500).json({ error: "Error al listar equipos" });
          console.log(error);
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      case "getEquipo":
        try {
          const query = "select * from inventory.equipo where id=$1";
          const result = await pool.query(query, [id]);
          console.log("RESPUESTA: ", result.rows);
          response.status(200).json({ data: result.rows });
        } catch (error) {
          response.status(500).json({ error: "Error al listar equipo" });
          console.log(error);
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      case "getEquipoVulnerabilidades":
        try {
          //const query =
          //  "select i.id as id_informe, v.id as id_vulnerabilidad, i.nombre as informe, v.nombre as vulnerabilidad, v.descripcion, v.cve, v.mitigacion_sugerida, v.referencia, iv.observacion, iv.estado from inventory.equipo_vulnerabilidad as ev JOIN inventory.vulnerabilidad as v ON v.id = ev.vulnerabilidad_id JOIN inventory.informe_vulnerabilidad as iv ON iv.vulnerabilidad_id = ev.vulnerabilidad_id JOIN inventory.equipo as e ON e.id = ev.equipo_id JOIN inventory.informe_equipo as ie ON ie.equipo_id = e.id JOIN inventory.informe as i ON ie.informe_id = i.id where e.id=$1";
          const query =
            "SELECT i.id AS id_informe, v.id AS id_vulnerabilidad,i.nombre AS informe,v.nombre AS vulnerabilidad,v.descripcion,v.cve,v.mitigacion_sugerida,v.referencia,iv.observacion,iv.estado FROM inventory.equipo AS e JOIN inventory.equipo_vulnerabilidad AS ev ON e.id = ev.equipo_id JOIN inventory.vulnerabilidad AS v ON v.id = ev.vulnerabilidad_id JOIN inventory.informe_vulnerabilidad AS iv ON iv.vulnerabilidad_id = v.id JOIN inventory.informe_equipo AS ie ON ie.equipo_id = e.id AND ie.informe_id = iv.informe_id JOIN inventory.informe AS i ON i.id = ie.informe_id WHERE e.id = $1";
          const result = await pool.query(query, [id]);
          console.log("RESPUESTA: ", result.rows);
          response.status(200).json({ data: result.rows });
        } catch (error) {
          response
            .status(500)
            .json({ error: "Error al listar las vulnerabilidades del equipo" });
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

      default:
        response.status(400).json({ error: "Solicitud no válida" });
        break;
    }
  } else {
    response.status(405).json({ error: "Método no permitido" });
  }
}
