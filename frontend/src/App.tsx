import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { getLanguage } from './hooks/useStats';
import { getTranslations, Language } from './i18n/translations';

function App() {
  const [fileUploaded, setFileUploaded] = useState(false);
  // Use a key to force Dashboard remount when new file is uploaded
  const [dashboardKey, setDashboardKey] = useState(0);
  
  // Make language reactive - default to 'en' if not set
  const [lang, setLang] = useState<Language>((getLanguage() || 'en') as Language);
  const tr = getTranslations(lang);
  
  // Update language when it changes in sessionStorage
  useEffect(() => {
    const checkLanguage = () => {
      const storedLang = getLanguage();
      if (storedLang && storedLang !== lang) {
        setLang(storedLang as Language);
      }
    };
    
    // Check on mount and whenever dashboardKey changes (new file uploaded)
    checkLanguage();
  }, [dashboardKey]);

  const handleUploadSuccess = () => {
    // Update language from storage after upload
    const storedLang = getLanguage();
    if (storedLang) {
      setLang(storedLang as Language);
    }
    // Increment key to force fresh Dashboard instance
    setDashboardKey(prev => prev + 1);
    setFileUploaded(true);
  };

  const handleReset = () => {
    setFileUploaded(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          {/* Left: Buy me a coffee (only on dashboard) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            {fileUploaded && (
              <a
                href="https://buymeacoffee.com/filippol"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: '#FFDD00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: '16px' }}>☕</span>
                Buy me a coffee
              </a>
            )}
          </div>
          
          {/* Center: Logo */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.png" alt="TalkStats" style={{ height: '60px', width: 'auto', padding: '8px 0' }} />
          </div>
          
          {/* Right: Upload new file button */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
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
                {tr.uploadNewFile}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', flex: 1 }}>
        {!fileUploaded ? (
          <div style={{ padding: '40px 20px' }}>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <Dashboard key={dashboardKey} />
        )}
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '20px',
        marginTop: '40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {tr.madeBy} <strong>Filippo M. Libardi</strong>
          </span>
          <span style={{ color: '#ccc' }}>|</span>
          <a
            href="https://github.com/FilippoL/WhatsAppConvAnalyzer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            {tr.contribute}
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;


