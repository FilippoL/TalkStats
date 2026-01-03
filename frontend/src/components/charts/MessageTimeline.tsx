import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesDataPoint } from '../../types';
import { format } from 'date-fns';
import { getTranslations, Language } from '../../i18n/translations';

interface MessageTimelineProps {
  data: TimeSeriesDataPoint[];
  timeGroup: string;
  lang: Language;
}

export function MessageTimeline({ data, timeGroup, lang }: MessageTimelineProps) {
  const tr = getTranslations(lang);
  const formattedData = data.map(point => ({
    ...point,
    timestamp: format(new Date(point.timestamp), getDateFormat(timeGroup)),
  }));

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <h3 style={{ marginBottom: '10px' }}>{tr.messageTimeline}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" name={tr.messages} />
        </LineChart>
      </ResponsiveContainer>
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


