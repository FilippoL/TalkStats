import { useState } from 'react';
import axios from 'axios';
import { Language, getTranslations } from '../i18n/translations';

const API_BASE = import.meta.env.VITE_API_BASE || '';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cacheKey: string | null;
}

export function ShareModal({ isOpen, onClose, lang, cacheKey }: ShareModalProps) {
  const tr = getTranslations(lang);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateShareLink = async () => {
    if (!cacheKey) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE}/api/share?key=${encodeURIComponent(cacheKey)}`);
      const { share_id } = response.data;
      
      // Generate the full share URL
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/share/${share_id}`;
      setShareUrl(fullUrl);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to generate share link';
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    setError(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
          {tr.shareLink}
        </h2>
        
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '4px',
            marginBottom: '15px',
          }}>
            {error}
          </div>
        )}
        
        {!shareUrl ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {tr.shareLinkExpires}
            </p>
            <button
              onClick={generateShareLink}
              disabled={isGenerating}
              style={{
                padding: '12px 24px',
                backgroundColor: isGenerating ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontSize: '16px',
              }}
            >
              {isGenerating ? tr.generating : (lang === 'it' ? 'Genera Link' : 'Generate Link')}
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '15px',
            }}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f5f5f5',
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '10px 16px',
                  backgroundColor: copied ? '#10b981' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? tr.shareLinkCopied : tr.copyLink}
              </button>
            </div>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              {tr.shareLinkExpires}
            </p>
          </div>
        )}
        
        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {tr.close}
          </button>
        </div>
      </div>
    </div>
  );
}
