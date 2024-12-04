import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import unzipper from "unzipper"; // Asegúrate de tener unzipper instalado
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

// Desactivamos el bodyParser para manejar el form directamente
export const config = {
  api: {
    bodyParser: false,
  },
};

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

// Función para comprimir archivos en un zip
async function compressFiles(outputPath: string, sourceDir: string) {
  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`${archive.pointer()} bytes written to ${outputPath}`);
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Añadir todos los archivos en el directorio temporal al archivo ZIP
    fs.readdirSync(sourceDir).forEach((file) => {
      const filePath = path.join(sourceDir, file);
      archive.file(filePath, { name: file });
    });

    archive.finalize();
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const storageDir = path.join(process.cwd(), "/storage");
  const client = await pool.connect();

  if (req.method === "POST") {
    try {
      await client.query("BEGIN");
      // Procesar el formulario con formidable
      const { fields, files }: { fields: any; files: any } = await new Promise(
        (resolve, reject) => {
          const form = new IncomingForm();
          const fields: any = {};

          form.on("field", (name, value) => {
            if (Array.isArray(fields[name])) {
              fields[name].push(value);
            } else if (fields[name]) {
              fields[name] = [fields[name], value];
            } else {
              fields[name] = value;
            }
          });

          form.parse(req, (err: any, _fields: any, files: any) => {
            if (err) reject({ err });
            resolve({ fields, files });
          });
        }
      );

      // Extraer id_informe y nombre_informe desde los campos del FormData
      const { id_informe, nombre_informe } = fields;

      if (!id_informe || !nombre_informe) {
        return res
          .status(400)
          .json({ error: "id_informe and nombre_informe are required" });
      }

      // Crear la carpeta de almacenamiento si no existe
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      // Crear una carpeta temporal para descomprimir y consolidar los archivos
      const tempDir = path.join(storageDir, `temp_${nombre_informe}`);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const zipFilePath = path.join(storageDir, `${nombre_informe}.zip`);
      console.log("zipFilePath: ", zipFilePath);

      // Si el zip ya existe, extraer su contenido a la carpeta temporal
      if (fs.existsSync(zipFilePath)) {
        await fs
          .createReadStream(zipFilePath)
          .pipe(unzipper.Extract({ path: tempDir }))
          .promise();
      }

      // Guardar los archivos recibidos en la carpeta temporal
      files.file.forEach(async (file: File) => {
        const fileId = uuidv4();
        const tempPath = file.filepath;
        const fileName = file.originalFilename || "unknown_name";
        const fileExtension = path.extname(fileName);
        const savePath = path.join(tempDir, fileName);
        fs.copyFileSync(tempPath, savePath);
        fs.unlinkSync(tempPath);

        // Insertar el archivo en la base de datos
        const query =
          "INSERT INTO inventory.archivo (id, nombre, informe_id, extension) VALUES ($1, $2, $3, $4)";
        await client.query(query, [fileId, fileName, id_informe, fileExtension]);
      });

      // Crear un nuevo archivo zip consolidado
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", function () {
        console.log(
          `Consolidated zip created: ${archive.pointer()} total bytes`
        );
      });

      archive.pipe(output);
      archive.directory(tempDir, false); // Consolidar los archivos desde la carpeta temporal
      await archive.finalize();

      // Eliminar la carpeta temporal después de la consolidación
      fs.rmdirSync(tempDir, { recursive: true });
      await client.query("COMMIT");
      res.status(200).json({
        message: "Files successfully received, consolidated, and saved",
      });
    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error al procesar los archivos:", error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const { informe_nombre, fileId } = req.query;

      if (!informe_nombre) {
        return res.status(400).json({ error: "El nombre del informe es requerido" });
      }
      /*const query =
        "SELECT * from inventory.archivo WHERE informe_id=$1";
      await client.query(query, [informe_nombre]);*/

      // Si se pide un archivo específico
      if (fileId) {
        const filePath = path.join(
          storageDir,
          informe_nombre as string,
          fileId as string
        );

        if (fs.existsSync(filePath)) {
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileId}"`
          );
          return fs.createReadStream(filePath).pipe(res);
        } else {
          return res.status(404).json({ error: "File not found" });
        }
      }

      // Si se pide el zip completo del informe
      const zipFilePath = path.join(storageDir, `${informe_nombre}.zip`);
      if (fs.existsSync(zipFilePath)) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${informe_nombre}.zip"`
        );
         fs.createReadStream(zipFilePath).pipe(res);
        
      } else {
        return res.status(404).json({ error: "Report not found" });
      }
    } catch (error: any) {
      console.error("Error al procesar la solicitud:", error);
      res.status(500).json({ message: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

// Función para descomprimir el archivo existente
async function extractExistingZip(zipPath: string, extractToDir: string) {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractToDir }))
      .on("close", resolve)
      .on("error", reject);
  });
}
