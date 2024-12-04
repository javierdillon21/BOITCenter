import React, { useRef, useState } from 'react';
 
interface DragAndDropProps {
  onFilesDrop: (files: FileList) => void;
}
 
const DragAndDropArea: React.FC<DragAndDropProps> = ({ onFilesDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
 
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
 
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDrop(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };
 
  const handleClick = () => {
    if (fileInputRef.current) {
fileInputRef.current.click();
    }
  };
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
if (e.target.files) {
onFilesDrop(e.target.files);
    }
  };
 
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '5px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: isDragging ? '#e0e0e0' : '#fafafa',
        color: isDragging ? '#333' : '#666',
        cursor: 'pointer',
      }}
    >
      {isDragging ? "Suelta los archivos aquí..." : "Arrastra y suelta archivos aquí o haz clic para subir"}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
      />
    </div>
  );
};
 
export default DragAndDropArea;