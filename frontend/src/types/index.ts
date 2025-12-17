export interface Message {
  timestamp: string;
  author: string;
  content: string;
  is_system: boolean;
  is_media: boolean;
  sentiment?: string;
  sentiment_score?: number;
}

export interface AuthorStats {
  author: string;
  message_count: number;
  avg_message_length: number;
  total_chars: number;
  media_count: number;
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

export interface MediaStats {
  total_media: number;
  media_percentage: number;
  media_by_author: Record<string, number>;
  media_over_time: TimeSeriesDataPoint[];
}

export interface StatsResponse {
  total_messages: number;
  total_authors: number;
  date_range: {
    start: string | null;
    end: string | null;
  };
  author_stats: AuthorStats[];
  sentiment_distribution: SentimentDistribution;
  media_stats?: MediaStats;
  time_series: TimeSeriesDataPoint[];
  grouped_data: {
    by_author?: Record<string, TimeSeriesDataPoint[]>;
    by_sentiment?: Record<string, TimeSeriesDataPoint[]>;
    hourly?: TimeSeriesDataPoint[];
    message_lengths?: number[];
    bestemmiometro?: BestemmiometroData;
  };
}

export interface BestemmiometroData {
  by_phrase: Record<string, number>;
  by_author: Record<string, Record<string, number>>;
  by_author_total: Record<string, number>;
  total: number;
}

export interface WordFrequencyItem {
  word: string;
  count: number;
  frequency: number;
}

export interface WordFrequencyResponse {
  words: WordFrequencyItem[];
  total_words: number;
  unique_words: number;
}

export interface Insight {
  title: string;
  description: string;
  value?: any;
  category: string;
}

export interface InsightResponse {
  insights: Insight[];
}

export interface UploadResponse {
  status: string;
  message_count: number;
  authors: string[];
  cache_key: string;
}


