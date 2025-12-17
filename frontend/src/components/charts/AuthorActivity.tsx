import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthorStats } from '../../types';

interface AuthorActivityProps {
  data: AuthorStats[];
}

export function AuthorActivity({ data }: AuthorActivityProps) {
  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>Author Activity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="author" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="message_count" fill="#8884d8" name="Messages" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


