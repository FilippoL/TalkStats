import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WordFrequencyItem } from '../../types';

interface WordFrequencyProps {
  data: WordFrequencyItem[];
  limit?: number;
}

export function WordFrequency({ data, limit = 20 }: WordFrequencyProps) {
  const displayData = data.slice(0, limit).reverse(); // Reverse to show top words at top

  return (
    <div style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>Most Frequent Words (Top {limit})</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="word" type="category" width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Occurrences" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


