import { useState, useEffect, useCallback } from 'react';
import { useStats, getLanguage } from '../hooks/useStats';
import { StatsResponse, WordFrequencyResponse, InsightResponse, EmojiStatsResponse } from '../types';
import { getTranslations, t, Language } from '../i18n/translations';
import { StatsCard } from './StatsCard';
import { AuthorSelector } from './AuthorSelector';
import { TimeRangeSelector } from './TimeRangeSelector';
import { MessageTimeline } from './charts/MessageTimeline';
import { HourlyTimeline } from './charts/HourlyTimeline';
import { AuthorActivity } from './charts/AuthorActivity';
import { WordFrequency } from './charts/WordFrequency';
import { ActivityHeatmap } from './charts/ActivityHeatmap';
import { MessageLengthDistribution } from './charts/MessageLengthDistribution';
import { MessageLengthHistogram } from './charts/MessageLengthHistogram';
import { MessageLengthComparison } from './charts/MessageLengthComparison';
import { MediaStatistics } from './charts/MediaStatistics';
import { Bestemmiometro } from './charts/Bestemmiometro';
import { EmojiStatistics } from './charts/EmojiStatistics';
import { ExportModal } from './ExportModal';
import { ShareModal } from './ShareModal';

interface DashboardProps {
  onSessionExpired?: () => void;
}

// Helper to get cache key from sessionStorage
const getCacheKey = (): string | null => sessionStorage.getItem('chatCacheKey');

export function Dashboard({ onSessionExpired }: DashboardProps) {
  const { getStats, getWordFrequency, getInsights, getEmojiStats, getAuthors, loading, error } = useStats();
  
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [wordFreq, setWordFreq] = useState<WordFrequencyResponse | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [emojiStats, setEmojiStats] = useState<EmojiStatsResponse | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [timeGroup, setTimeGroup] = useState<string>('day');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Author mapping for merging/deletion functionality
  const [authorMapping, setAuthorMapping] = useState<Record<string, string>>({});
  const [deletedAuthors, setDeletedAuthors] = useState<Set<string>>(new Set());
  const [originalAuthors, setOriginalAuthors] = useState<string[]>([]);
  
  // Export and Share modal states
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Get language from session storage
  const lang = (getLanguage() || 'en') as Language;
  const tr = getTranslations(lang);

  // Simulated progress for loading bar
  useEffect(() => {
    if (loading && !stats) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev; // Cap at 90% until actually loaded
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (stats) {
      setLoadingProgress(100);
    }
  }, [loading, stats]);

  useEffect(() => {
    loadData();
  }, [selectedAuthors, timeGroup, startDate, endDate, authorMapping, deletedAuthors]);

  // Fetch original authors on mount - only once to prevent infinite loop
  useEffect(() => {
    const fetchOriginalAuthors = async () => {
      try {
        const authors = await getAuthors();
        setOriginalAuthors(authors);
      } catch (err) {
        console.error('Failed to fetch authors:', err);
      }
    };
    fetchOriginalAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - run only once on mount

  // Helper functions for author mapping
  const applyAuthorMapping = (data: any): any => {
    if (!data) return data;
    
    // Deep clone the data to avoid mutating the original
    const mappedData = JSON.parse(JSON.stringify(data));
    
    // Apply mapping to author stats
    if (mappedData.author_stats) {
      const mergedStats: Record<string, any> = {};
      
      mappedData.author_stats.forEach((stat: any) => {
        const originalAuthor = stat.author;
        const mappedAuthor = authorMapping[originalAuthor] || originalAuthor;
        
        if (deletedAuthors.has(originalAuthor)) {
          return; // Skip deleted authors
        }
        
        if (!mergedStats[mappedAuthor]) {
          mergedStats[mappedAuthor] = { ...stat, author: mappedAuthor };
        } else {
          // Merge stats
          mergedStats[mappedAuthor].message_count += stat.message_count;
          mergedStats[mappedAuthor].word_count += stat.word_count;
          mergedStats[mappedAuthor].character_count += stat.character_count;
          mergedStats[mappedAuthor].media_count += stat.media_count;
          mergedStats[mappedAuthor].avg_message_length = 
            (mergedStats[mappedAuthor].character_count / mergedStats[mappedAuthor].message_count);
        }
      });
      
      mappedData.author_stats = Object.values(mergedStats);
      // Update total_authors to reflect the new merged count
      mappedData.total_authors = mappedData.author_stats.length;
      // Update total_messages to reflect the sum of remaining authors' messages
      mappedData.total_messages = mappedData.author_stats.reduce(
        (sum: number, stat: any) => sum + stat.message_count, 0
      );
    }
    
    // Apply mapping to grouped data by author
    if (mappedData.grouped_data?.by_author) {
      const mergedGrouped: Record<string, any> = {};
      
      Object.entries(mappedData.grouped_data.by_author).forEach(([author, authorData]: [string, any]) => {
        const mappedAuthor = authorMapping[author] || author;
        
        if (deletedAuthors.has(author)) {
          return; // Skip deleted authors
        }
        
        if (!mergedGrouped[mappedAuthor]) {
          mergedGrouped[mappedAuthor] = authorData;
        } else {
          // Merge time series data
          mergedGrouped[mappedAuthor] = mergedGrouped[mappedAuthor].map((point: any, index: number) => ({
            ...point,
            count: point.count + (authorData[index]?.count || 0)
          }));
        }
      });
      
      mappedData.grouped_data.by_author = mergedGrouped;
    }

    // Apply mapping to media_stats.media_by_author
    if (mappedData.media_stats?.media_by_author) {
      const mergedMedia: Record<string, number> = {};
      
      Object.entries(mappedData.media_stats.media_by_author).forEach(([author, count]: [string, any]) => {
        const mappedAuthor = authorMapping[author] || author;
        
        if (deletedAuthors.has(author)) {
          return;
        }
        
        mergedMedia[mappedAuthor] = (mergedMedia[mappedAuthor] || 0) + count;
      });
      
      mappedData.media_stats.media_by_author = mergedMedia;
    }

    // Apply mapping to bestemmiometro
    if (mappedData.grouped_data?.bestemmiometro) {
      const bestemmiometro = mappedData.grouped_data.bestemmiometro;
      
      // Merge by_author (Record<string, Record<string, number>>)
      if (bestemmiometro.by_author) {
        const mergedByAuthor: Record<string, Record<string, number>> = {};
        
        Object.entries(bestemmiometro.by_author).forEach(([author, phrases]: [string, any]) => {
          const mappedAuthor = authorMapping[author] || author;
          
          if (deletedAuthors.has(author)) {
            return;
          }
          
          if (!mergedByAuthor[mappedAuthor]) {
            mergedByAuthor[mappedAuthor] = { ...phrases };
          } else {
            Object.entries(phrases).forEach(([phrase, count]: [string, any]) => {
              mergedByAuthor[mappedAuthor][phrase] = (mergedByAuthor[mappedAuthor][phrase] || 0) + count;
            });
          }
        });
        
        bestemmiometro.by_author = mergedByAuthor;
      }
      
      // Merge by_author_total (Record<string, number>)
      if (bestemmiometro.by_author_total) {
        const mergedTotal: Record<string, number> = {};
        
        Object.entries(bestemmiometro.by_author_total).forEach(([author, count]: [string, any]) => {
          const mappedAuthor = authorMapping[author] || author;
          
          if (deletedAuthors.has(author)) {
            return;
          }
          
          mergedTotal[mappedAuthor] = (mergedTotal[mappedAuthor] || 0) + count;
        });
        
        bestemmiometro.by_author_total = mergedTotal;
      }
      
      // Merge per_capita (Record<string, number>)
      if (bestemmiometro.per_capita) {
        const mergedPerCapita: Record<string, number> = {};
        
        Object.entries(bestemmiometro.per_capita).forEach(([author, value]: [string, any]) => {
          const mappedAuthor = authorMapping[author] || author;
          
          if (deletedAuthors.has(author)) {
            return;
          }
          
          // For per capita, we average when merging
          if (!mergedPerCapita[mappedAuthor]) {
            mergedPerCapita[mappedAuthor] = value;
          } else {
            mergedPerCapita[mappedAuthor] = (mergedPerCapita[mappedAuthor] + value) / 2;
          }
        });
        
        bestemmiometro.per_capita = mergedPerCapita;
      }
      
      // Merge climax_by_author (Record<string, number>)
      if (bestemmiometro.climax_by_author) {
        const mergedClimax: Record<string, number> = {};
        
        Object.entries(bestemmiometro.climax_by_author).forEach(([author, count]: [string, any]) => {
          const mappedAuthor = authorMapping[author] || author;
          
          if (deletedAuthors.has(author)) {
            return;
          }
          
          mergedClimax[mappedAuthor] = (mergedClimax[mappedAuthor] || 0) + count;
        });
        
        bestemmiometro.climax_by_author = mergedClimax;
      }
      
      // Update consecutive_streaks author names
      if (bestemmiometro.consecutive_streaks) {
        bestemmiometro.consecutive_streaks = bestemmiometro.consecutive_streaks
          .filter((streak: any) => !deletedAuthors.has(streak.author))
          .map((streak: any) => ({
            ...streak,
            author: authorMapping[streak.author] || streak.author
          }));
      }
      
      // Update climax_instances author names
      if (bestemmiometro.climax_instances) {
        bestemmiometro.climax_instances = bestemmiometro.climax_instances
          .filter((instance: any) => !deletedAuthors.has(instance.author))
          .map((instance: any) => ({
            ...instance,
            author: authorMapping[instance.author] || instance.author
          }));
      }
    }
    
    return mappedData;
  };

  // Apply author mapping to emoji stats
  const applyEmojiMapping = (data: any): any => {
    if (!data) return data;
    
    const mappedData = JSON.parse(JSON.stringify(data));
    
    if (mappedData.by_author) {
      const mergedByAuthor: Record<string, any> = {};
      
      Object.entries(mappedData.by_author).forEach(([author, stats]: [string, any]) => {
        const mappedAuthor = authorMapping[author] || author;
        
        if (deletedAuthors.has(author)) {
          return;
        }
        
        if (!mergedByAuthor[mappedAuthor]) {
          mergedByAuthor[mappedAuthor] = { ...stats };
        } else {
          // Merge emoji stats
          mergedByAuthor[mappedAuthor].total += stats.total;
          mergedByAuthor[mappedAuthor].unique = Math.max(mergedByAuthor[mappedAuthor].unique, stats.unique);
          
          // Merge top_emojis arrays
          const emojiCounts: Record<string, number> = {};
          [...mergedByAuthor[mappedAuthor].top_emojis, ...stats.top_emojis].forEach((item: any) => {
            emojiCounts[item.emoji] = (emojiCounts[item.emoji] || 0) + item.count;
          });
          mergedByAuthor[mappedAuthor].top_emojis = Object.entries(emojiCounts)
            .map(([emoji, count]) => ({ emoji, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          
          // Recalculate per_message average
          mergedByAuthor[mappedAuthor].per_message = 
            (mergedByAuthor[mappedAuthor].per_message + stats.per_message) / 2;
        }
      });
      
      mappedData.by_author = mergedByAuthor;
    }
    
    return mappedData;
  };

  // Apply author filtering to insights
  const applyInsightsMapping = (data: any): any => {
    if (!data || !data.insights) return data;
    
    const mappedData = JSON.parse(JSON.stringify(data));
    
    // Filter insights based on deleted authors and selected authors
    mappedData.insights = mappedData.insights.filter((insight: any) => {
      const author = insight.author || insight.name;
      
      // Filter out deleted authors
      if (deletedAuthors.has(author)) {
        return false;
      }
      
      // If we have selected authors, only show insights for selected ones
      if (selectedAuthors.length > 0) {
        // Check if this insight is about a selected author or a merged name
        return selectedAuthors.includes(author);
      }
      
      return true;
    });
    
    return mappedData;
  };

  const getEffectiveSelectedAuthors = (): string[] => {
    // We need to send ORIGINAL author names to the API, not merged names
    // The mapping is applied client-side after data is received
    
    if (selectedAuthors.length === 0) {
      // No filter - return undefined to get all authors
      return [];
    }
    
    // Expand merged names back to original authors for API query
    const expandedAuthors = new Set<string>();
    
    selectedAuthors.forEach(author => {
      // Check if this is a merged name - find all original authors mapped to it
      const originalAuthorsForMerge = Object.entries(authorMapping)
        .filter(([_, merged]) => merged === author)
        .map(([original, _]) => original);
      
      if (originalAuthorsForMerge.length > 0) {
        // It's a merged name - add all original authors
        originalAuthorsForMerge.forEach(a => expandedAuthors.add(a));
      } else if (!deletedAuthors.has(author)) {
        // It's an original author name
        expandedAuthors.add(author);
      }
    });
    
    return Array.from(expandedAuthors);
  };

  const getAvailableAuthors = (): string[] => {
    // Return original authors minus deleted ones and minus those that were merged,
    // plus the merged author names
    const mergedOriginals = new Set(Object.keys(authorMapping));
    const available = originalAuthors.filter(
      author => !deletedAuthors.has(author) && !mergedOriginals.has(author)
    );
    const mergedNames = [...new Set(Object.values(authorMapping))];
    return [...available, ...mergedNames];
  };

  const handleMergeAuthors = (authorsToMerge: string[], mergedName: string) => {
    const newMapping = { ...authorMapping };
    authorsToMerge.forEach(author => {
      newMapping[author] = mergedName;
    });
    setAuthorMapping(newMapping);
    
    // Keep all currently selected authors, but replace the merged ones with the new merged name
    // If any of the merged authors were selected, add the merged name
    const anyMergedWasSelected = authorsToMerge.some(author => selectedAuthors.includes(author));
    let newSelectedAuthors = selectedAuthors.filter(author => !authorsToMerge.includes(author));
    if (anyMergedWasSelected) {
      newSelectedAuthors = [...newSelectedAuthors, mergedName];
    }
    setSelectedAuthors([...new Set(newSelectedAuthors)]); // Remove duplicates
  };

  const handleDeleteAuthor = (authorToDelete: string) => {
    const newDeletedAuthors = new Set(deletedAuthors);
    newDeletedAuthors.add(authorToDelete);
    setDeletedAuthors(newDeletedAuthors);
    
    // Remove from selected authors
    setSelectedAuthors(selectedAuthors.filter(author => author !== authorToDelete));
  };

  const handleResetAuthors = () => {
    setAuthorMapping({});
    setDeletedAuthors(new Set());
    setSelectedAuthors([]);
  };

  const hasAuthorModifications = Object.keys(authorMapping).length > 0 || deletedAuthors.size > 0;

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshProgress(10);
    
    try {
      setRefreshProgress(25);
      const effectiveAuthors = getEffectiveSelectedAuthors();
      const [statsData, wordFreqData, insightsData, emojiData] = await Promise.all([
        getStats({
          authors: effectiveAuthors.length > 0 ? effectiveAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          timeGroup,
          groupByAuthor: true,
        }),
        getWordFrequency({
          authors: effectiveAuthors.length > 0 ? effectiveAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          limit: 50,
          minLength: 1,
        }),
        getInsights(),
        getEmojiStats({
          authors: effectiveAuthors.length > 0 ? effectiveAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      
      setRefreshProgress(90);
      // Apply author mapping to the results
      setStats(applyAuthorMapping(statsData));
      setWordFreq(wordFreqData); // Word frequency doesn't need mapping as it's global
      setInsights(applyInsightsMapping(insightsData));
      setEmojiStats(applyEmojiMapping(emojiData));
      setRefreshProgress(100);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      // Check if this is a session expired error (HTTP 400 with specific message)
      // Only trigger redirect if it's definitely a "no data" error, not a transient network issue
      const errorMessage = err?.message || '';
      const isNoDataError = errorMessage.includes('No data available') && errorMessage.includes('upload a file');
      if (isNoDataError) {
        // Clear session storage and show session expired state
        sessionStorage.removeItem('chatCacheKey');
        sessionStorage.removeItem('chatLanguage');
        setSessionExpired(true);
      }
    } finally {
      setIsRefreshing(false);
      setRefreshProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAuthors, timeGroup, startDate, endDate, authorMapping, deletedAuthors, originalAuthors]);

  if (loading && !stats) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '30px' }}>
          {/* Animated icon */}
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>
            📊
          </div>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>
            {tr.loadingDashboard}
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {lang === 'it' ? 'Analizzando i tuoi messaggi...' : 'Analyzing your messages...'}
          </p>
        </div>
        
        {/* Progress bar container */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          {/* Progress bar fill */}
          <div style={{
            width: `${loadingProgress}%`,
            height: '100%',
            backgroundColor: '#007bff',
            borderRadius: '4px',
            transition: 'width 0.3s ease-out'
          }} />
        </div>
        
        <div style={{ color: '#999', fontSize: '12px' }}>
          {Math.round(loadingProgress)}%
        </div>
      </div>
    );
  }

  // Show session expired message with button to upload new file
  if (sessionExpired) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2 style={{ margin: '0 0 12px 0', color: '#333' }}>
          {lang === 'it' ? 'Sessione Scaduta' : 'Session Expired'}
        </h2>
        <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
          {lang === 'it' 
            ? 'I dati della chat non sono più disponibili. Per favore carica nuovamente il file.'
            : 'Your chat data is no longer available. Please upload your file again.'}
        </p>
        <button
          onClick={() => onSessionExpired?.()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          {lang === 'it' ? 'Carica Nuovo File' : 'Upload New File'}
        </button>
      </div>
    );
  }

  if (error && !stats) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!stats) {
    console.log('No stats, returning null');
    return null;
  }

  console.log('Rendering dashboard');
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Export and Share Modals */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        lang={lang}
        hasBestemmiometro={!!stats.grouped_data?.bestemmiometro && stats.grouped_data.bestemmiometro.total > 0}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        lang={lang}
        cacheKey={getCacheKey()}
      />
      
      {/* Main Dashboard Content (for PDF export) */}
      <div id="dashboard-content">
      {/* Filters */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{tr.filters}</h2>
            {isRefreshing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {lang === 'it' ? 'Aggiornamento...' : 'Refreshing...'} {Math.round(refreshProgress)}%
                </span>
                <div style={{
                  width: '100px',
                  height: '6px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${refreshProgress}%`,
                    height: '100%',
                    backgroundColor: '#007bff',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease-out'
                  }} />
                </div>
              </div>
            )}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => loadData()}
                disabled={isRefreshing}
                style={{
                  padding: '8px 14px',
                  backgroundColor: isRefreshing ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {isRefreshing ? (lang === 'it' ? 'Aggiornamento...' : 'Refreshing...') : (lang === 'it' ? 'Aggiorna' : 'Refresh')}
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {tr.share}
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {tr.exportPDF}
              </button>
            </div>
          </div>
        </div>
        <AuthorSelector 
          selectedAuthors={selectedAuthors}
          onSelectionChange={setSelectedAuthors}
          onMergeAuthors={handleMergeAuthors}
          onDeleteAuthor={handleDeleteAuthor}
          onReset={handleResetAuthors}
          hasModifications={hasAuthorModifications}
          availableAuthors={getAvailableAuthors()}
          lang={lang}
        />
        <TimeRangeSelector
          timeGroup={timeGroup}
          onTimeGroupChange={setTimeGroup}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          lang={lang}
        />
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatsCard 
          title={tr.totalMessages}
          value={stats.total_messages}
          subtitle={t(tr.fromAuthors, { count: stats.total_authors })}
        />
        <StatsCard 
          title={tr.uniqueAuthors}
          value={stats.total_authors}
        />
        {stats.date_range.start && stats.date_range.end && (
          <StatsCard 
            title={tr.dateRange}
            value={new Date(stats.date_range.start).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US')}
            subtitle={`${tr.to} ${new Date(stats.date_range.end).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US')}`}
          />
        )}
      </div>

      {/* Insights */}
      {insights && insights.insights.length > 0 && (
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '20px'
        }}>
          <h2 style={{ marginBottom: '15px', marginTop: 0 }}>{tr.insights}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {insights.insights.map((insight, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  borderLeft: '4px solid #007bff',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  {insight.title}
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Show hourly timeline when day grouping is selected (in addition to the regular timeline) */}
        {timeGroup === 'day' && stats.grouped_data?.hourly && stats.grouped_data.hourly.length > 0 && (
          <div id="chart-hourly-timeline" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <HourlyTimeline data={stats.grouped_data.hourly} lang={lang} />
          </div>
        )}
        
        {/* Regular timeline showing message count over time (from start date to end date) */}
        {stats.time_series.length > 0 && (
          <div id="chart-message-timeline" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <MessageTimeline data={stats.time_series} timeGroup={timeGroup} lang={lang} />
          </div>
        )}
        
        {stats.author_stats.length > 0 && (
          <>
            <div id="chart-author-activity" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
              <AuthorActivity data={stats.author_stats} lang={lang} />
            </div>
            <div id="chart-message-length" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
              <MessageLengthDistribution data={stats.author_stats} lang={lang} />
              <MessageLengthComparison data={stats.author_stats} lang={lang} />
            </div>
          </>
        )}
        
        {stats.grouped_data?.message_lengths && stats.grouped_data.message_lengths.length > 0 && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <MessageLengthHistogram messageLengths={stats.grouped_data.message_lengths} lang={lang} />
          </div>
        )}
        
        {stats.media_stats && (
          <div id="chart-media-stats" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <MediaStatistics data={stats.media_stats} timeGroup={timeGroup} totalMessages={stats.total_messages} lang={lang} />
          </div>
        )}
        
        {stats.time_series.length > 0 && timeGroup === 'hour' && (
          <div id="chart-activity-heatmap" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <ActivityHeatmap data={stats.time_series} lang={lang} />
          </div>
        )}
        
        {wordFreq && wordFreq.words.length > 0 && (
          <div id="chart-word-frequency" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <WordFrequency data={wordFreq.words} limit={30} lang={lang} />
          </div>
        )}
        
        {emojiStats && emojiStats.total_emojis > 0 && (
          <div id="chart-emoji-stats" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <EmojiStatistics data={emojiStats} lang={lang} />
          </div>
        )}
        
        {stats.grouped_data?.bestemmiometro && (
          <div id="chart-bestemmiometro" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
            <Bestemmiometro data={stats.grouped_data.bestemmiometro} />
          </div>
        )}
      </div>
      </div>{/* End dashboard-content */}
    </div>
  );
}


