import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MediaStats } from '../../types';
import { format } from 'date-fns';

interface MediaStatisticsProps {
  data: MediaStats;
  timeGroup: string;
  totalMessages: number;
}

export function MediaStatistics({ data, timeGroup, totalMessages }: MediaStatisticsProps) {
  // Convert media_by_author to array for chart
  const mediaByAuthorData = Object.entries(data.media_by_author).map(([author, count]) => ({
    author,
    count,
  })).sort((a, b) => b.count - a.count);

  // Format time series data
  const formattedTimeSeries = data.media_over_time.map(point => ({
    ...point,
    timestamp: format(new Date(point.timestamp), getDateFormat(timeGroup)),
  }));

  return (
    <div style={{ width: '100%', marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '20px' }}>Media Statistics</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        {/* Media by Author - Bar Chart */}
        {mediaByAuthorData.length > 0 && (
          <div style={{ height: '400px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Media Messages by Author</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mediaByAuthorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="author" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Media Messages" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Media Distribution Pie Chart */}
        <div style={{ height: '400px' }}>
          <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Media vs Text Messages</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Media', value: data.total_media },
                  { name: 'Text', value: totalMessages - data.total_media },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#0088FE" />
                <Cell fill="#00C49F" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Media Over Time */}
      {formattedTimeSeries.length > 0 && (
        <div style={{ height: '400px' }}>
          <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Media Messages Over Time</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#FF8042" name="Media Messages" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function getDateFormat(timeGroup: string): string {
  switch (timeGroup) {
    case 'hour':
      return 'MMM dd HH:mm';
    case 'day':
      return 'MMM dd, yyyy';
    case 'week':
      return 'MMM dd, yyyy';
    case 'month':
      return 'MMM yyyy';
    default:
      return 'MMM dd, yyyy';
  }
}

