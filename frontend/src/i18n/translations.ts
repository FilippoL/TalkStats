// Centralized translations for all dashboard components
export type Language = 'it' | 'en';

export const translations = {
  it: {
    // App level
    buyMeCoffee: 'Offrimi un caffè',
    uploadNewFile: 'Carica Nuovo File',
    
    // File Upload
    language: 'Lingua:',
    italiano: '🇮🇹 Italiano',
    english: '🇬🇧 English',
    dragDropFile: 'Trascina e rilascia il file di esportazione chat WhatsApp qui',
    orClickToBrowse: 'oppure clicca per sfogliare (.txt o .zip)',
    selectFile: 'Seleziona File',
    processingFile: 'Elaborazione file...',
    error: 'Errore',
    howToExport: 'Come Esportare la Chat WhatsApp',
    android: 'Android',
    iphone: 'iPhone / iOS',
    androidStep1: 'Apri la chat che vuoi esportare',
    androidStep2: 'Tocca il menu tre puntini (in alto a destra)',
    androidStep3: 'Seleziona <strong>Altro</strong> > <strong>Esporta chat</strong>',
    androidStep4: 'Scegli <strong>Senza media</strong>',
    androidStep5: 'Salva o condividi il file .txt o .zip',
    iosStep1: 'Apri la chat che vuoi esportare',
    iosStep2: 'Tocca il nome del contatto/gruppo in alto',
    iosStep3: 'Scorri verso il basso e tocca <strong>Esporta chat</strong>',
    iosStep4: 'Scegli <strong>Senza media</strong>',
    iosStep5: 'Salva su File o invia a te stesso',
    exportNote: '<strong>Nota:</strong> Esporta senza media per un\'elaborazione più veloce. Puoi caricare direttamente il file .zip o .txt esportato.',
    
    // Dashboard
    filters: 'Filtri',
    insights: 'Approfondimenti',
    loadingDashboard: 'Caricamento dashboard...',
    
    // Stats Cards
    totalMessages: 'Messaggi Totali',
    fromAuthors: 'Da {count} autori',
    uniqueAuthors: 'Autori Unici',
    dateRange: 'Intervallo Date',
    to: 'a',
    
    // Author Selector
    authors: 'Autori:',
    loadingAuthors: 'Caricamento autori...',
    
    // Time Range Selector
    timeGrouping: 'Raggruppamento Temporale:',
    hour: 'Ora',
    day: 'Giorno',
    week: 'Settimana',
    month: 'Mese',
    startDate: 'Data Inizio:',
    endDate: 'Data Fine:',
    
    // Chart Titles
    messageTimeline: 'Timeline Messaggi',
    messagesByHour: 'Messaggi per Ora del Giorno',
    authorActivity: 'Attività per Autore',
    avgMessageLength: 'Lunghezza Media Messaggi per Autore',
    messageLengthStats: 'Statistiche Lunghezza Messaggi per Autore',
    messageLengthDistribution: 'Distribuzione Lunghezza Messaggi',
    activityHeatmap: 'Mappa di Calore Attività (Giorno vs Ora)',
    mostFrequentWords: 'Parole Più Frequenti (Top {limit})',
    mediaStatistics: 'Statistiche Media',
    mediaByAuthor: 'Messaggi Media per Autore',
    mediaVsText: 'Media vs Messaggi di Testo',
    mediaOverTime: 'Messaggi Media nel Tempo',
    
    // Chart Labels
    messages: 'Messaggi',
    occurrences: 'Occorrenze',
    avgCharacters: 'Caratteri Medi',
    avgLength: 'Lunghezza Media (car.)',
    totalCharacters: 'Caratteri Totali',
    media: 'Media',
    text: 'Testo',
    mediaMessages: 'Messaggi Media',
    
    // Days of week
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    sunday: 'Domenica',
    
    // Bestemmiometro (already defined in component, but adding here for consistency)
    bestemmiometroTitle: 'Bestemmiometro',
    total: 'Totale',
    per100msg: 'Per 100 msg',
    uniqueTypes: 'Tipi Diversi',
    climaxDetected: 'Climax Rilevati',
    
    // Emoji Statistics
    emojiStatistics: 'Statistiche Emoji',
    totalEmojis: 'Emoji Totali',
    uniqueEmojis: 'Emoji Unici',
    emojisPerMessage: 'Emoji per Messaggio',
    mostUsedEmojis: 'Emoji Più Usati',
    emojisByAuthor: 'Emoji per Autore',
    emojisPerAuthor: 'Uso Emoji per Autore',
    favoriteEmojisByAuthor: 'Emoji Preferiti per Autore',
    emojis: 'emoji',
    perMessage: 'per msg',
    
    // Footer (always in English)
    madeBy: 'Made by',
    contribute: 'Contribute',
    
    // Support Section (FileUpload)
    supportTitle: 'Supporta il Progetto',
    supportText: "È gratis per te da usare, ma mantenere tutto questo attivo non è gratis per me. eheh",
    
    // Feature Suggestion Section (FileUpload)
    suggestFeatureTitle: 'Suggerisci una Funzionalità',
    suggestFeatureText: 'Hai un\'idea? Fammelo sapere!',
    suggestFeatureButton: 'Apri Issue su GitHub',
    
    // Export & Share
    exportPDF: 'Esporta PDF',
    exportOptions: 'Opzioni Esportazione',
    exportBestemmiometroOnly: 'Solo Bestemmiometro',
    exportFullReport: 'Report Completo',
    exportSelected: 'Sezioni Selezionate',
    selectSections: 'Seleziona Sezioni',
    exporting: 'Esportazione...',
    share: 'Condividi',
    shareLink: 'Link di Condivisione',
    shareLinkCopied: 'Link copiato!',
    shareLinkExpires: 'Il link scade tra 1 ora',
    copyLink: 'Copia Link',
    generating: 'Generazione...',
    close: 'Chiudi',
  },
  en: {
    // App level
    buyMeCoffee: 'Buy me a coffee',
    uploadNewFile: 'Upload New File',
    
    // File Upload
    language: 'Language:',
    italiano: '🇮🇹 Italiano',
    english: '🇬🇧 English',
    dragDropFile: 'Drag and drop your WhatsApp chat export file here',
    orClickToBrowse: 'or click to browse (.txt or .zip)',
    selectFile: 'Select File',
    processingFile: 'Processing file...',
    error: 'Error',
    howToExport: 'How to Export Your WhatsApp Chat',
    android: 'Android',
    iphone: 'iPhone / iOS',
    androidStep1: 'Open the chat you want to export',
    androidStep2: 'Tap the three dots menu (top right)',
    androidStep3: 'Select <strong>More</strong> > <strong>Export chat</strong>',
    androidStep4: 'Choose <strong>Without media</strong>',
    androidStep5: 'Save or share the .txt or .zip file',
    iosStep1: 'Open the chat you want to export',
    iosStep2: 'Tap the contact/group name at the top',
    iosStep3: 'Scroll down and tap <strong>Export Chat</strong>',
    iosStep4: 'Choose <strong>Without Media</strong>',
    iosStep5: 'Save to Files or send to yourself',
    exportNote: '<strong>Note:</strong> Export without media for faster processing. You can upload the .zip or .txt file directly.',
    
    // Dashboard
    filters: 'Filters',
    insights: 'Insights',
    loadingDashboard: 'Loading dashboard...',
    
    // Stats Cards
    totalMessages: 'Total Messages',
    fromAuthors: 'From {count} authors',
    uniqueAuthors: 'Unique Authors',
    dateRange: 'Date Range',
    to: 'to',
    
    // Author Selector
    authors: 'Authors:',
    loadingAuthors: 'Loading authors...',
    
    // Time Range Selector
    timeGrouping: 'Time Grouping:',
    hour: 'Hour',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    startDate: 'Start Date:',
    endDate: 'End Date:',
    
    // Chart Titles
    messageTimeline: 'Message Timeline',
    messagesByHour: 'Messages by Hour of Day',
    authorActivity: 'Author Activity',
    avgMessageLength: 'Average Message Length by Author',
    messageLengthStats: 'Message Length Statistics by Author',
    messageLengthDistribution: 'Message Length Distribution',
    activityHeatmap: 'Activity Heatmap (Day of Week vs Hour)',
    mostFrequentWords: 'Most Frequent Words (Top {limit})',
    mediaStatistics: 'Media Statistics',
    mediaByAuthor: 'Media Messages by Author',
    mediaVsText: 'Media vs Text Messages',
    mediaOverTime: 'Media Messages Over Time',
    
    // Chart Labels
    messages: 'Messages',
    occurrences: 'Occurrences',
    avgCharacters: 'Avg Characters',
    avgLength: 'Avg Length (chars)',
    totalCharacters: 'Total Characters',
    media: 'Media',
    text: 'Text',
    mediaMessages: 'Media Messages',
    
    // Days of week
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Bestemmiometro
    bestemmiometroTitle: 'Swear-O-Meter',
    total: 'Total',
    per100msg: 'Per 100 msg',
    uniqueTypes: 'Unique Words',
    climaxDetected: 'Emphasis Found',
    
    // Emoji Statistics
    emojiStatistics: 'Emoji Statistics',
    totalEmojis: 'Total Emojis',
    uniqueEmojis: 'Unique Emojis',
    emojisPerMessage: 'Emojis per Message',
    mostUsedEmojis: 'Most Used Emojis',
    emojisByAuthor: 'Emojis by Author',
    emojisPerAuthor: 'Emoji Usage by Author',
    favoriteEmojisByAuthor: 'Favorite Emojis by Author',
    emojis: 'emojis',
    perMessage: 'per msg',
    
    // Footer (always in English)
    madeBy: 'Made by',
    contribute: 'Contribute',
    
    // Support Section (FileUpload)
    supportTitle: 'Support the Project',
    supportText: "It's free for you to use, but keeping this whole thing running isn't free for me. eheh",
    
    // Feature Suggestion Section (FileUpload)
    suggestFeatureTitle: 'Suggest a Feature',
    suggestFeatureText: 'Have an idea? Let me know!',
    suggestFeatureButton: 'Open GitHub Issue',
    
    // Export & Share
    exportPDF: 'Export PDF',
    exportOptions: 'Export Options',
    exportBestemmiometroOnly: 'Swear-O-Meter Only',
    exportFullReport: 'Full Report',
    exportSelected: 'Selected Sections',
    selectSections: 'Select Sections',
    exporting: 'Exporting...',
    share: 'Share',
    shareLink: 'Share Link',
    shareLinkCopied: 'Link copied!',
    shareLinkExpires: 'Link expires in 1 hour',
    copyLink: 'Copy Link',
    generating: 'Generating...',
    close: 'Close',
  },
};

export type TranslationKey = keyof typeof translations.en;

export function getTranslations(lang: Language) {
  return translations[lang] || translations.en;
}

// Helper to replace {placeholder} in strings
export function t(text: string, replacements?: Record<string, string | number>): string {
  if (!replacements) return text;
  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(`{${key}}`, String(value)),
    text
  );
}
