import { useState, useEffect } from 'react';
import { useStats } from '../hooks/useStats';
import { StatsResponse, WordFrequencyResponse, InsightResponse } from '../types';
import { StatsCard } from './StatsCard';
import { AuthorSelector } from './AuthorSelector';
import { TimeRangeSelector } from './TimeRangeSelector';
import { SentimentFilter } from './SentimentFilter';
import { MessageTimeline } from './charts/MessageTimeline';
import { HourlyTimeline } from './charts/HourlyTimeline';
import { AuthorActivity } from './charts/AuthorActivity';
import { SentimentDistributionChart } from './charts/SentimentDistribution';
import { WordFrequency } from './charts/WordFrequency';
import { ActivityHeatmap } from './charts/ActivityHeatmap';
import { MessageLengthDistribution } from './charts/MessageLengthDistribution';
import { MessageLengthHistogram } from './charts/MessageLengthHistogram';
import { MessageLengthComparison } from './charts/MessageLengthComparison';
import { SentimentOverTime } from './charts/SentimentOverTime';
import { MediaStatistics } from './charts/MediaStatistics';
import { Bestemmiometro } from './charts/Bestemmiometro';

export function Dashboard() {
  const { getStats, getWordFrequency, getInsights, loading, error } = useStats();
  
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [wordFreq, setWordFreq] = useState<WordFrequencyResponse | null>(null);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [timeGroup, setTimeGroup] = useState<string>('day');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSentiment, setSelectedSentiment] = useState<string | undefined>();

  useEffect(() => {
    loadData();
  }, [selectedAuthors, timeGroup, startDate, endDate, selectedSentiment]);

  const loadData = async () => {
    try {
      const [statsData, wordFreqData, insightsData] = await Promise.all([
        getStats({
          authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          timeGroup,
          sentiment: selectedSentiment,
          groupByAuthor: true,
          groupBySentiment: true,
        }),
        getWordFrequency({
          authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sentiment: selectedSentiment,
          limit: 50,
          minLength: 1,
        }),
        getInsights(),
      ]);
      
      setStats(statsData);
      setWordFreq(wordFreqData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  if (loading && !stats) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  if (error && !stats) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>WhatsApp Conversation Dashboard</h1>
      
      {/* Filters */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Filters</h2>
        <AuthorSelector 
          selectedAuthors={selectedAuthors}
          onSelectionChange={setSelectedAuthors}
        />
        <TimeRangeSelector
          timeGroup={timeGroup}
          onTimeGroupChange={setTimeGroup}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <SentimentFilter
          selectedSentiment={selectedSentiment}
          onSentimentChange={setSelectedSentiment}
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
          title="Total Messages" 
          value={stats.total_messages}
          subtitle={`From ${stats.total_authors} authors`}
        />
        <StatsCard 
          title="Unique Authors" 
          value={stats.total_authors}
        />
        {stats.date_range.start && stats.date_range.end && (
          <StatsCard 
            title="Date Range"
            value={new Date(stats.date_range.start).toLocaleDateString()}
            subtitle={`to ${new Date(stats.date_range.end).toLocaleDateString()}`}
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
          <h2 style={{ marginBottom: '15px' }}>Insights</h2>
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
          <HourlyTimeline data={stats.grouped_data.hourly} />
        )}
        
        {/* Regular timeline showing message count over time (from start date to end date) */}
        {stats.time_series.length > 0 && (
          <MessageTimeline data={stats.time_series} timeGroup={timeGroup} />
        )}
        
        {stats.author_stats.length > 0 && (
          <>
            <AuthorActivity data={stats.author_stats} />
            <MessageLengthDistribution data={stats.author_stats} />
            <MessageLengthComparison data={stats.author_stats} />
          </>
        )}
        
        {stats.grouped_data?.message_lengths && stats.grouped_data.message_lengths.length > 0 && (
          <MessageLengthHistogram messageLengths={stats.grouped_data.message_lengths} />
        )}
        
        {stats.sentiment_distribution && (
          <SentimentDistributionChart data={stats.sentiment_distribution} />
        )}
        
        {stats.grouped_data?.by_sentiment && Object.keys(stats.grouped_data.by_sentiment).length > 0 && (
          <SentimentOverTime data={stats.grouped_data.by_sentiment} />
        )}
        
        {stats.media_stats && (
          <MediaStatistics data={stats.media_stats} timeGroup={timeGroup} totalMessages={stats.total_messages} />
        )}
        
        {stats.time_series.length > 0 && timeGroup === 'hour' && (
          <ActivityHeatmap data={stats.time_series} />
        )}
        
        {wordFreq && wordFreq.words.length > 0 && (
          <WordFrequency data={wordFreq.words} limit={30} />
        )}
        
        {stats.grouped_data?.bestemmiometro && (
          <Bestemmiometro data={stats.grouped_data.bestemmiometro} />
        )}
      </div>
    </div>
  );
}


