import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesDataPoint } from '../../types';
import { getTranslations, Language } from '../../i18n/translations';

interface HourlyTimelineProps {
  data: TimeSeriesDataPoint[];
  lang: Language;
}

export function HourlyTimeline({ data, lang }: HourlyTimelineProps) {
  const tr = getTranslations(lang);
  
  // Group data by hour (0-23)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourMessages = data.filter(point => {
      const date = new Date(point.timestamp);
      return date.getHours() === hour;
    });
    return {
      hour: `${hour}:00`,
      value: hourMessages.reduce((sum, p) => sum + p.value, 0),
    };
  });

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>{tr.messagesByHour}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" name={tr.messages} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

