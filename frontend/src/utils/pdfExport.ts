import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type ExportSection = 
  | 'bestemmiometro'
  | 'message-timeline'
  | 'hourly-timeline'
  | 'author-activity'
  | 'message-length'
  | 'word-frequency'
  | 'emoji-stats'
  | 'media-stats'
  | 'heatmap'
  | 'all';

interface ExportOptions {
  sections: ExportSection[];
  filename?: string;
  quality?: number;
}

const SECTION_IDS: Record<ExportSection, string> = {
  'bestemmiometro': 'chart-bestemmiometro',
  'message-timeline': 'chart-message-timeline',
  'hourly-timeline': 'chart-hourly-timeline',
  'author-activity': 'chart-author-activity',
  'message-length': 'chart-message-length',
  'word-frequency': 'chart-word-frequency',
  'emoji-stats': 'chart-emoji-stats',
  'media-stats': 'chart-media-stats',
  'heatmap': 'chart-activity-heatmap',
  'all': 'dashboard-content',
};

/**
 * Exports selected dashboard sections to PDF
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { sections, filename = 'whatsapp-stats', quality = 2 } = options;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  
  let isFirstPage = true;
  
  // If 'all' is selected, export the entire dashboard
  if (sections.includes('all')) {
    const element = document.getElementById(SECTION_IDS['all']);
    if (element) {
      await addElementToPDF(pdf, element, { margin, contentWidth, pageWidth, pageHeight, quality, isFirstPage: true });
    }
  } else {
    // Export selected sections
    for (const section of sections) {
      const elementId = SECTION_IDS[section];
      const element = document.getElementById(elementId);
      
      if (element) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        await addElementToPDF(pdf, element, { margin, contentWidth, pageWidth, pageHeight, quality, isFirstPage });
        isFirstPage = false;
      }
    }
  }
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  pdf.save(`${filename}-${timestamp}.pdf`);
}

interface PDFAddOptions {
  margin: number;
  contentWidth: number;
  pageWidth: number;
  pageHeight: number;
  quality: number;
  isFirstPage: boolean;
}

async function addElementToPDF(
  pdf: jsPDF,
  element: HTMLElement,
  options: PDFAddOptions
): Promise<void> {
  const { margin, contentWidth, pageHeight, quality } = options;
  
  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    
    // Handle multi-page content
    let heightLeft = imgHeight;
    let position = margin;
    
    // Add first portion
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - margin * 2);
    
    // Add remaining pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
    }
  } catch (error) {
    console.error('Error capturing element for PDF:', error);
  }
}

/**
 * Export only the Bestemmiometro section
 */
export async function exportBestemmiometroToPDF(): Promise<void> {
  return exportToPDF({
    sections: ['bestemmiometro'],
    filename: 'bestemmiometro',
  });
}

/**
 * Export the full dashboard
 */
export async function exportFullDashboardToPDF(): Promise<void> {
  return exportToPDF({
    sections: ['all'],
    filename: 'whatsapp-stats-full',
  });
}
