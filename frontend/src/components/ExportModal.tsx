import { useState } from 'react';
import { ExportSection, exportToPDF } from '../utils/pdfExport';
import { Language, getTranslations } from '../i18n/translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  hasBestemmiometro: boolean;
}

const SECTION_OPTIONS: { id: ExportSection; labelKey: string }[] = [
  { id: 'message-timeline', labelKey: 'messageTimeline' },
  { id: 'hourly-timeline', labelKey: 'messagesByHour' },
  { id: 'author-activity', labelKey: 'authorActivity' },
  { id: 'message-length', labelKey: 'messageLengthStats' },
  { id: 'word-frequency', labelKey: 'mostFrequentWords' },
  { id: 'emoji-stats', labelKey: 'emojiStatistics' },
  { id: 'media-stats', labelKey: 'mediaStatistics' },
  { id: 'heatmap', labelKey: 'activityHeatmap' },
  { id: 'bestemmiometro', labelKey: 'bestemmiometroTitle' },
];

export function ExportModal({ isOpen, onClose, lang, hasBestemmiometro }: ExportModalProps) {
  const tr = getTranslations(lang);
  const [exportType, setExportType] = useState<'bestemmiometro' | 'full' | 'selected'>('full');
  const [selectedSections, setSelectedSections] = useState<ExportSection[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let sections: ExportSection[] = [];
      
      if (exportType === 'bestemmiometro') {
        sections = ['bestemmiometro'];
      } else if (exportType === 'full') {
        sections = ['all'];
      } else {
        sections = selectedSections;
      }
      
      await exportToPDF({ sections });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (section: ExportSection) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const availableSections = SECTION_OPTIONS.filter(
    s => s.id !== 'bestemmiometro' || hasBestemmiometro
  );

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
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{tr.exportOptions}</h2>
        
        {/* Export Type Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="exportType"
              checked={exportType === 'full'}
              onChange={() => setExportType('full')}
              style={{ marginRight: '10px' }}
            />
            <span>{tr.exportFullReport}</span>
          </label>
          
          {hasBestemmiometro && (
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="exportType"
                checked={exportType === 'bestemmiometro'}
                onChange={() => setExportType('bestemmiometro')}
                style={{ marginRight: '10px' }}
              />
              <span>{tr.exportBestemmiometroOnly}</span>
            </label>
          )}
          
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="exportType"
              checked={exportType === 'selected'}
              onChange={() => setExportType('selected')}
              style={{ marginRight: '10px' }}
            />
            <span>{tr.exportSelected}</span>
          </label>
        </div>
        
        {/* Section Selection (only if 'selected' is chosen) */}
        {exportType === 'selected' && (
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>{tr.selectSections}</h4>
            {availableSections.map(({ id, labelKey }) => (
              <label 
                key={id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSections.includes(id)}
                  onChange={() => toggleSection(id)}
                  style={{ marginRight: '10px' }}
                />
                <span>{(tr as Record<string, string>)[labelKey] || labelKey}</span>
              </label>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
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
          <button
            onClick={handleExport}
            disabled={isExporting || (exportType === 'selected' && selectedSections.length === 0)}
            style={{
              padding: '10px 20px',
              backgroundColor: isExporting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isExporting ? tr.exporting : tr.exportPDF}
          </button>
        </div>
      </div>
    </div>
  );
}
