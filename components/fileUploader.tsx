import React, { useState } from "react";
import DragAndDropArea from "./drag-drop";

const FileUploader: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesDrop = (files: FileList) => {
    // Convertir FileList a Array y almacenarlo en el estado
    setUploadedFiles(Array.from(files));

    // Enviar los archivos al servidor
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    // Enviar archivos al servidor con fetch
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Archivos subidos:", data);
      })
      .catch((error) => {
        console.error("Error al subir archivos:", error);
      });
  };

  return (
    <div>
      <DragAndDropArea onFilesDrop={handleFilesDrop} />
      {uploadedFiles.length > 0 && (
        <div>
          <h4>Archivos seleccionados:</h4>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
