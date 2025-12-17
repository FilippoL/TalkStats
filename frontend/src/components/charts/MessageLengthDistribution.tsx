import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthorStats } from '../../types';

interface MessageLengthDistributionProps {
  data: AuthorStats[];
}

export function MessageLengthDistribution({ data }: MessageLengthDistributionProps) {
  const chartData = data.map(author => ({
    author: author.author,
    avgLength: Math.round(author.avg_message_length),
  }));

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>Average Message Length by Author</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="author" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgLength" fill="#82ca9d" name="Avg Characters" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

