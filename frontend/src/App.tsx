import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';

function App() {
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleUploadSuccess = () => {
    setFileUploaded(true);
  };

  const handleReset = () => {
    setFileUploaded(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #e0e0e0',
        padding: '15px 20px',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>WhatsApp Conversation Analyzer</h1>
          {fileUploaded && (
            <button
              onClick={handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Upload New File
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {!fileUploaded ? (
          <div style={{ padding: '40px 20px' }}>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
}

export default App;


