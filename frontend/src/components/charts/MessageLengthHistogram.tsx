import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTranslations, Language } from '../../i18n/translations';

interface MessageLengthHistogramProps {
  messageLengths: number[];
  lang: Language;
}

export function MessageLengthHistogram({ messageLengths, lang }: MessageLengthHistogramProps) {
  const tr = getTranslations(lang);
  
  // Define bins for message length (0-50, 50-100, 100-200, 200-500, 500-1000, 1000+)
  const bins = [
    { range: '0-50', min: 0, max: 50 },
    { range: '50-100', min: 50, max: 100 },
    { range: '100-200', min: 100, max: 200 },
    { range: '200-500', min: 200, max: 500 },
    { range: '500-1000', min: 500, max: 1000 },
    { range: '1000+', min: 1000, max: Infinity },
  ];

  // Count messages in each bin
  const binData = bins.map(bin => {
    const count = messageLengths.filter(length => 
      length >= bin.min && length < bin.max
    ).length;
    return {
      range: bin.range,
      count,
    };
  });

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '0px' }}>
      <h3 style={{ marginBottom: '10px' }}>{tr.messageLengthDistribution}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={binData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name={tr.messages} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

