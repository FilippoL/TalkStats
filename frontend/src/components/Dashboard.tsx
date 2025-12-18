import { useState, useEffect } from 'react';
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

export function Dashboard() {
  const { getStats, getWordFrequency, getInsights, getEmojiStats, loading, error } = useStats();
  
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [wordFreq, setWordFreq] = useState<WordFrequencyResponse | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [emojiStats, setEmojiStats] = useState<EmojiStatsResponse | null>(null);
  
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [timeGroup, setTimeGroup] = useState<string>('day');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Get language from session storage
  const lang = (getLanguage() || 'en') as Language;
  const tr = getTranslations(lang);

  useEffect(() => {
    loadData();
  }, [selectedAuthors, timeGroup, startDate, endDate]);

  const loadData = async () => {
    try {
      const [statsData, wordFreqData, insightsData, emojiData] = await Promise.all([
        getStats({
          authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          timeGroup,
          groupByAuthor: true,
        }),
        getWordFrequency({
          authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          limit: 50,
          minLength: 1,
        }),
        getInsights(),
        getEmojiStats({
          authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      
      setStats(statsData);
      setWordFreq(wordFreqData);
      setInsights(insightsData);
      setEmojiStats(emojiData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  if (loading && !stats) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{tr.loadingDashboard}</div>;
  }

  if (error && !stats) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Filters */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>{tr.filters}</h2>
        <AuthorSelector 
          selectedAuthors={selectedAuthors}
          onSelectionChange={setSelectedAuthors}
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
      <div style={{ 
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
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '15px' }}>{tr.insights}</h2>
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
          <HourlyTimeline data={stats.grouped_data.hourly} lang={lang} />
        )}
        
        {/* Regular timeline showing message count over time (from start date to end date) */}
        {stats.time_series.length > 0 && (
          <MessageTimeline data={stats.time_series} timeGroup={timeGroup} lang={lang} />
        )}
        
        {stats.author_stats.length > 0 && (
          <>
            <AuthorActivity data={stats.author_stats} lang={lang} />
            <MessageLengthDistribution data={stats.author_stats} lang={lang} />
            <MessageLengthComparison data={stats.author_stats} lang={lang} />
          </>
        )}
        
        {stats.grouped_data?.message_lengths && stats.grouped_data.message_lengths.length > 0 && (
          <MessageLengthHistogram messageLengths={stats.grouped_data.message_lengths} lang={lang} />
        )}
        
        {stats.media_stats && (
          <MediaStatistics data={stats.media_stats} timeGroup={timeGroup} totalMessages={stats.total_messages} lang={lang} />
        )}
        
        {stats.time_series.length > 0 && timeGroup === 'hour' && (
          <ActivityHeatmap data={stats.time_series} lang={lang} />
        )}
        
        {wordFreq && wordFreq.words.length > 0 && (
          <WordFrequency data={wordFreq.words} limit={30} lang={lang} />
        )}
        
        {emojiStats && emojiStats.total_emojis > 0 && (
          <EmojiStatistics data={emojiStats} lang={lang} />
        )}
        
        {stats.grouped_data?.bestemmiometro && (
          <Bestemmiometro data={stats.grouped_data.bestemmiometro} />
        )}
      </div>
    </div>
  );
}


