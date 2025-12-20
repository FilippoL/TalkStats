import { useState, useRef } from 'react';
import { useStats } from '../hooks/useStats';
import { getTranslations } from '../i18n/translations';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, loading, error } = useStats();
  
  // Upload page always in English
  const tr = getTranslations('en');

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
      // No language param - backend will auto-detect
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
    <div>
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
          accept=".txt,.zip"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        {loading ? (
          <div>
            <p>{tr.processingFile}</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              {tr.dragDropFile}
            </p>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {tr.orClickToBrowse}
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
              {tr.selectFile}
            </button>
            {error && (
              <p style={{ color: 'red', marginTop: '10px' }}>
                {tr.error}: {error}
              </p>
            )}
          </>
        )}
      </div>

      {/* Export Instructions */}
      <div style={{
        marginTop: '40px',
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'left',
      }}>
        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>{tr.howToExport}</h3>
        
        <div className="instructions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Android Instructions */}
          <div>
            <h4 style={{ color: '#25D366', marginBottom: '15px' }}>{tr.android}</h4>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>{tr.androidStep1}</li>
              <li>{tr.androidStep2}</li>
              <li dangerouslySetInnerHTML={{ __html: tr.androidStep3 }} />
              <li dangerouslySetInnerHTML={{ __html: tr.androidStep4 }} />
              <li>{tr.androidStep5}</li>
            </ol>
          </div>

          {/* iOS Instructions */}
          <div>
            <h4 style={{ color: '#007AFF', marginBottom: '15px' }}>{tr.iphone}</h4>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>{tr.iosStep1}</li>
              <li>{tr.iosStep2}</li>
              <li dangerouslySetInnerHTML={{ __html: tr.iosStep3 }} />
              <li dangerouslySetInnerHTML={{ __html: tr.iosStep4 }} />
              <li>{tr.iosStep5}</li>
            </ol>
          </div>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '6px',
          borderLeft: '4px solid #007bff'
        }}
          dangerouslySetInnerHTML={{ __html: tr.exportNote }}
        />
      </div>

      {/* Support and Feature Suggestion Sections - Side by Side */}
      <div className="support-grid" style={{
        marginTop: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {/* Support Section */}
        <div style={{
          padding: '30px',
          backgroundColor: '#fff9e6',
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #FFDD00',
        }}>
          <h3 style={{ marginBottom: '15px' }}>
            {tr.supportTitle}
          </h3>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            {tr.supportText}
          </p>
          <a
            href="https://buymeacoffee.com/filippol"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#FFDD00',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Buy me a coffee
          </a>
        </div>

        {/* Feature Suggestion Section */}
        <div style={{
          padding: '30px',
          backgroundColor: '#f0f7ff',
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px solid #007bff',
        }}>
          <h3 style={{ marginBottom: '15px' }}>
            {tr.suggestFeatureTitle}
          </h3>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            {tr.suggestFeatureText}
          </p>
          <a
            href="https://github.com/FilippoL/WhatsAppConvAnalyzer/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            {tr.suggestFeatureButton}
          </a>
        </div>
      </div>
    </div>
  );
}


