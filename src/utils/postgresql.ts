import { Connection } from "postgresql-client";

const pgsqlConnection = new Connection({
    host: "localhost",
    port: 5432,
    user: "admint",
    password: "tBpA/-12*03P",
    database: "bd_inventory",
  });

export default async function DBconnection(sql: string) {
    try {
      const con = await pgsqlConnection.connect();
      const res = await pgsqlConnection.query(sql);
      // 'select * from "InitialTables"."Informe"'
      console.log("RESPUESTA: ", res.rows);
      console.log("campos: ", res.fields);
      await pgsqlConnection.close();
      return res;
    } catch (err) {
      console.log(err);
    }
    return;
  }