import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { StatsResponse, WordFrequencyResponse, InsightResponse, EmojiStatsResponse } from '../types';
import { getTranslations, t, Language } from '../i18n/translations';
import { StatsCard } from './StatsCard';
import { MessageTimeline } from './charts/MessageTimeline';
import { HourlyTimeline } from './charts/HourlyTimeline';
import { AuthorActivity } from './charts/AuthorActivity';
import { WordFrequency } from './charts/WordFrequency';
import { MessageLengthDistribution } from './charts/MessageLengthDistribution';
import { MessageLengthComparison } from './charts/MessageLengthComparison';
import { MediaStatistics } from './charts/MediaStatistics';
import { Bestemmiometro } from './charts/Bestemmiometro';
import { EmojiStatistics } from './charts/EmojiStatistics';

const API_BASE = import.meta.env.VITE_API_BASE || '';

interface SharedDashboardProps {
  shareId: string;
}

interface SharedSnapshot {
  stats: StatsResponse;
  word_freq: WordFrequencyResponse;
  insights: InsightResponse;
  emoji_stats: EmojiStatsResponse;
  language: string;
  created_at: string;
  expires_at: string;
}

export function SharedDashboard({ shareId }: SharedDashboardProps) {
  const [snapshot, setSnapshot] = useState<SharedSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSharedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<SharedSnapshot>(`${API_BASE}/api/share/${shareId}`);
      setSnapshot(response.data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load shared data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    loadSharedData();
  }, [loadSharedData]);

  if (loading) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2>Loading shared report...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2>Share Link Expired or Invalid</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <a 
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Upload Your Own Chat
        </a>
      </div>
    );
  }

  if (!snapshot) return null;

  const { stats, word_freq: wordFreq, insights, emoji_stats: emojiStats, language } = snapshot;
  const lang = (language === 'it' ? 'it' : 'en') as Language;
  const tr = getTranslations(lang);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Shared Banner */}
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '15px 20px',
        marginBottom: '20px',
      }}>
        <strong>{lang === 'it' ? 'Report Condiviso' : 'Shared Report'}</strong>
        <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#92400e' }}>
          {lang === 'it' 
            ? 'Questo è un link condiviso in sola lettura. I dati sono stati congelati al momento della condivisione.'
            : 'This is a read-only shared link. Data was frozen at the time of sharing.'}
        </p>
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
      {insights && insights.insights && insights.insights.length > 0 && (
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
        {stats.grouped_data?.hourly && stats.grouped_data.hourly.length > 0 && (
          <HourlyTimeline data={stats.grouped_data.hourly} lang={lang} />
        )}
        
        {stats.time_series && stats.time_series.length > 0 && (
          <MessageTimeline data={stats.time_series} timeGroup="day" lang={lang} />
        )}
        
        {stats.author_stats && stats.author_stats.length > 0 && (
          <>
            <AuthorActivity data={stats.author_stats} lang={lang} />
            <MessageLengthDistribution data={stats.author_stats} lang={lang} />
            <MessageLengthComparison data={stats.author_stats} lang={lang} />
          </>
        )}
        
        {stats.media_stats && (
          <MediaStatistics data={stats.media_stats} timeGroup="day" totalMessages={stats.total_messages} lang={lang} />
        )}
        
        {wordFreq && wordFreq.words && wordFreq.words.length > 0 && (
          <WordFrequency data={wordFreq.words} limit={30} lang={lang} />
        )}
        
        {emojiStats && emojiStats.total_emojis > 0 && (
          <EmojiStatistics data={emojiStats} lang={lang} />
        )}
        
        {stats.grouped_data?.bestemmiometro && (
          <Bestemmiometro data={stats.grouped_data.bestemmiometro} />
        )}
      </div>
      
      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '30px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
      }}>
        <h3 style={{ marginBottom: '15px' }}>
          {lang === 'it' ? 'Ti piace? Analizza la tua chat!' : 'Like it? Analyze your own chat!'}
        </h3>
        <a 
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        >
          {lang === 'it' ? 'Carica la Tua Chat' : 'Upload Your Chat'}
        </a>
      </div>
    </div>
  );
}
