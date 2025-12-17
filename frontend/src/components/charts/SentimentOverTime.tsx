import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface SentimentOverTimeProps {
  data: { [sentiment: string]: Array<{ timestamp: string; value: number }> };
}

export function SentimentOverTime({ data }: SentimentOverTimeProps) {
  // Combine all sentiment time series into a single dataset
  const allTimestamps = new Set<string>();
  Object.values(data).forEach(series => {
    series.forEach(point => allTimestamps.add(point.timestamp));
  });

  const sortedTimestamps = Array.from(allTimestamps).sort();
  
  const chartData = sortedTimestamps.map(timestamp => {
    const point: any = {
      timestamp: format(new Date(timestamp), 'MMM dd, yyyy'),
      date: timestamp,
    };
    
    Object.keys(data).forEach(sentiment => {
      const series = data[sentiment];
      const match = series.find(p => p.timestamp === timestamp);
      point[sentiment] = match ? match.value : 0;
    });
    
    return point;
  });

  const colors: { [key: string]: string } = {
    positive: '#4caf50',
    negative: '#f44336',
    neutral: '#9e9e9e',
    joy: '#ff9800',
    anger: '#e91e63',
    sadness: '#2196f3',
    fear: '#9c27b0',
  };

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>Sentiment Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(data).map(sentiment => (
            <Line
              key={sentiment}
              type="monotone"
              dataKey={sentiment}
              stroke={colors[sentiment] || '#8884d8'}
              name={sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

