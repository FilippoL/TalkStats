import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthorStats } from '../../types';
import { getTranslations, Language } from '../../i18n/translations';

interface MessageLengthComparisonProps {
  data: AuthorStats[];
  lang: Language;
}

export function MessageLengthComparison({ data, lang }: MessageLengthComparisonProps) {
  const tr = getTranslations(lang);
  
  // We'll calculate min, max, and avg for each author
  // Note: We only have avg_length in AuthorStats, so we'll show that with ranges
  // For a more complete view, we'd need the backend to provide min/max
  
  const chartData = data.map(author => ({
    author: author.author,
    avgLength: Math.round(author.avg_message_length),
    totalChars: author.total_chars,
    messageCount: author.message_count,
  })).sort((a, b) => b.avgLength - a.avgLength);

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '0px' }}>
      <h3 style={{ marginBottom: '10px' }}>{tr.messageLengthStats}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="author" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="avgLength" fill="#8884d8" name={tr.avgLength} />
          <Bar yAxisId="right" dataKey="totalChars" fill="#82ca9d" name={tr.totalCharacters} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

