import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthorStats } from '../../types';
import { getTranslations, Language } from '../../i18n/translations';

interface MessageLengthDistributionProps {
  data: AuthorStats[];
  lang: Language;
}

export function MessageLengthDistribution({ data, lang }: MessageLengthDistributionProps) {
  const tr = getTranslations(lang);
  const chartData = data.map(author => ({
    author: author.author,
    avgLength: Math.round(author.avg_message_length),
  }));

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '0px' }}>
      <h3 style={{ marginBottom: '10px' }}>{tr.avgMessageLength}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="author" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgLength" fill="#82ca9d" name={tr.avgCharacters} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

