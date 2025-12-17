import { useState, useRef } from 'react';
import { useStats } from '../hooks/useStats';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, loading, error } = useStats();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      await uploadFile(file);
      onUploadSuccess();
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`file-upload ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: dragActive ? '#f0f0f0' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      
      {loading ? (
        <div>
          <p>Processing file...</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            Drag and drop your WhatsApp chat export file here
          </p>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            or click to browse
          </p>
          <button
            onClick={onButtonClick}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Select File
          </button>
          {error && (
            <p style={{ color: 'red', marginTop: '10px' }}>
              Error: {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}


