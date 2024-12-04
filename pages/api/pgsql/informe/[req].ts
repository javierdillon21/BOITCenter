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

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log("request.query: ", request.query);
  const client = await pool.connect();

  if (request.method === "GET") {
    const { nombre, req } = request.query;

    switch (req) {
      case "listInforme":
        try {
          const query =
            "SELECT id, nombre, emisor,fecha_recepcion, fecha_compromiso, fecha_entrega, estado FROM inventory.informe";
          const result = await client.query(query);
          response.status(200).json({
            fields: result.fields,
            rows: result.rows,
            rowCount: result.rowCount,
          });
        } catch (error) {
          response.status(500).json({ error: "Error listando informes" });
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      case "getInforme":
        try {
          const query = "SELECT * FROM inventory.informe WHERE nombre=$1";
          const result = await client.query(query, [nombre]);
          response.status(200).json({
            fields: result.fields,
            rows: result.rows,
            rowCount: result.rowCount,
          });
        } catch (error) {
          response.status(500).json({ error: "Error listando el informe" });
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      case "getInformeVulnerabilidades":
        try {
          //const query =
          //  "SELECT e.hostname, e.ips, v.id AS vulnerabilidad_id, v.nombre AS vulnerabilidad, v.descripcion AS descripcion, v.cve, v.mitigacion_sugerida, v.referencia, iv.observacion, iv.estado AS estado_vulnerabilidad, e.id AS equipo_id, e.id_proactiva, e.responsable_boitc, e.responsable_servicio FROM inventory.informe i JOIN inventory.informe_vulnerabilidad iv ON i.id = iv.informe_id JOIN inventory.vulnerabilidad v ON iv.vulnerabilidad_id = v.id JOIN inventory.equipo_vulnerabilidad ev ON v.id = ev.vulnerabilidad_id JOIN inventory.equipo e ON ev.equipo_id = e.id WHERE i.nombre = $1";

          const query =
            "SELECT e.hostname, e.ips, v.id AS vulnerabilidad_id, v.nombre AS vulnerabilidad, v.descripcion AS descripcion, v.mitigacion_sugerida, iv.observacion, iv.estado AS estado_vulnerabilidad, e.id AS equipo_id, e.id_proactiva FROM inventory.informe i JOIN inventory.informe_vulnerabilidad iv ON i.id = iv.informe_id JOIN inventory.vulnerabilidad v ON iv.vulnerabilidad_id = v.id JOIN inventory.equipo_vulnerabilidad ev ON v.id = ev.vulnerabilidad_id JOIN inventory.equipo e ON ev.equipo_id = e.id WHERE i.nombre = $1";
          const result = await client.query(query, [nombre]);
          response.status(200).json({
            fields: result.fields,
            rows: result.rows,
            rowCount: result.rowCount,
          });
        } catch (error) {
          console.log(error);
          response
            .status(500)
            .json({ error: "Error listando las vulnerabilidades del informe" });
        } finally {
          client.release(true);
          console.log("cliente realease destroyed");
        }
        break;
      case "getArchivosFromInforme":
        try {
          const query = "SELECT * from inventory.archivo where informe_id = $1";
          const result = await client.query(query, [request.query.id]);
          response.status(200).json({
            fields: result.fields,
            rows: result.rows,
            rowCount: result.rowCount,
          });
        } catch (error) {
          console.log(error);
          response
            .status(500)
            .json({ error: "Error listando los archivos del informe" });
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
      case "submitInforme":
        const { records, metadata }: submitInformeInput =
          data as submitInformeInput;

        try {
          await client.query("BEGIN");

          // Insertar el informe
          const informeResult = await client.query(
            "INSERT INTO inventory.informe (nombre, emisor, fecha_recepcion, fecha_compromiso, estado) VALUES ($1, $2, $3, ARRAY[$4]::DATE[], $5) RETURNING id",
            [
              metadata.informe,
              metadata.emisor,
              metadata.fecha_recepcion,
              metadata.fecha_compromiso,
              "Pendiente",
            ]
          );
          const informeId = informeResult.rows[0].id;

          for (const record of records) {
            // Insertar o actualizar equipo
            const equipoResult = await client.query(
              "INSERT INTO inventory.equipo (id_proactiva, sistema_operativo, clasificaciones, localizacion, hipervisor, responsable_boitc, responsable_servicio, responsable_so, descripcion, tipo, ips, hostname) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id_proactiva) DO UPDATE SET sistema_operativo = EXCLUDED.sistema_operativo, clasificaciones = EXCLUDED.clasificaciones, localizacion = EXCLUDED.localizacion, hipervisor = EXCLUDED.hipervisor, responsable_boitc = EXCLUDED.responsable_boitc, responsable_servicio = EXCLUDED.responsable_servicio, responsable_so = EXCLUDED.responsable_so, descripcion = EXCLUDED.descripcion, tipo = EXCLUDED.tipo, ips = EXCLUDED.ips, hostname = EXCLUDED.hostname RETURNING id",
              [
                record.id_proactiva, // $1
                record.sistema_operativo, // $2
                record.clasificaciones, // $3
                record.localizacion, // $4
                record.hipervisor, // $5
                record.responsable_boitc, // $6
                record.responsable_servicio, // $7
                record.responsable_so, // $8
                record.descripcion, // $9
                record.tipo, // $10
                record.IP, // $11
                record.hostname, // $12
              ]
            );
            const equipoId = equipoResult.rows[0].id;

            // Insertar o actualizar vulnerabilidad
            const vulnerabilidadResult = await client.query(
              "INSERT INTO inventory.vulnerabilidad (nombre, descripcion, cve, mitigacion_sugerida, referencia) VALUES ($1, $2, $3, $4, $5) RETURNING id",
              [
                record.Vulnerabilidad,
                record.Descripción,
                record.CVE,
                record["Mitigación sugerida"],
                record.Referencia,
              ]
            );
            const vulnerabilidadId = vulnerabilidadResult.rows[0].id;

            // Relacionar informe con equipo
            await client.query(
              "INSERT INTO inventory.informe_equipo (informe_id, equipo_id) VALUES ($1, $2) ON CONFLICT (informe_id, equipo_id) DO NOTHING",
              [informeId, equipoId]
            );

            // Relacionar informe con vulnerabilidad
            await client.query(
              "INSERT INTO inventory.informe_vulnerabilidad (informe_id, vulnerabilidad_id, estado, observacion) VALUES ($1, $2, $3, $4)",
              [informeId, vulnerabilidadId, "Pendiente", ""]
            );

            // Relacionar equipo con vulnerabilidad
            await client.query(
              "INSERT INTO inventory.equipo_vulnerabilidad (equipo_id, vulnerabilidad_id) VALUES ($1, $2)",
              [equipoId, vulnerabilidadId]
            );
          }

          await client.query("COMMIT");
          response.status(200).json({ message: "Informe creado exitosamente" });
        } catch (error) {
          await client.query("ROLLBACK");
          console.error("Error al crear el informe:", error);
          response.status(500).json({ error: "Error al crear el informe" });
        } finally {
          client.release(true);
        }
        break;
      case "updateInformeCompromiso":
        const { id, fecha_compromiso } = data as updateInformeCompromisoInput;

        try {
          await client.query("BEGIN");

          const queryResult = await client.query(
            "UPDATE inventory.informe SET fecha_compromiso = array_append(fecha_compromiso, $3) WHERE id = $1 RETURNING fecha_compromiso",
            [id, fecha_compromiso]
          );

          await client.query("COMMIT");
          response.status(200).json({
            message: "Compromiso añadido exitosamente",
            result: queryResult,
          });
        } catch (error) {
          await client.query("ROLLBACK");
          console.error("Error al añadir el nuevo compromiso:", error);
          response
            .status(500)
            .json({ error: "Error al añadir el nuevo compromiso" });
        } finally {
          client.release(true);
        }
        break;

      case "updateInformeEntrega":
        const { id_informe, fecha_entrega } = data as updateInformeEntregaInput;

        try {
          await client.query("BEGIN");

          console.log();
          const queryResult = await client.query(
            "UPDATE inventory.informe SET fecha_entrega = $2, estado=$3 WHERE id = $1 RETURNING fecha_entrega",
            [id_informe, fecha_entrega, "Entregado"]
          );

          await client.query("COMMIT");
          response.status(200).json({
            message: "Entrega añadida exitosamente",
            result: queryResult,
          });
        } catch (error) {
          await client.query("ROLLBACK");
          console.error("Error al añadir la fecha de entrega:", error);
          response
            .status(500)
            .json({ error: "Error al añadir la fecha de entrega" });
        } finally {
          client.release(true);
        }
        break;
        case "deleteInforme":
          const informe = (data as deleteInformeInput).id_informe;
          try {
            await client.query("BEGIN");
            const query = "DELETE FROM inventory.informe WHERE id=$1";
            const result = await client.query(query, [informe]);
            await client.query("COMMIT");
            response.status(200).json({
              message: "El informe ha sido eliminado existosamente."
            });
          } catch (error) {
            await client.query("ROLLBACK");
            console.log(error);
            response
              .status(500)
              .json({ error: "Error al eliminar el informe" });
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
