import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getTranslations, Language } from '../../i18n/translations';

interface EmojiItem {
  emoji: string;
  count: number;
}

interface AuthorEmojiStats {
  total: number;
  unique: number;
  top_emojis: EmojiItem[];
  per_message: number;
}

interface EmojiStatsData {
  total_emojis: number;
  unique_emojis: number;
  top_emojis: EmojiItem[];
  by_author: Record<string, AuthorEmojiStats>;
  emojis_per_message: number;
}

interface EmojiStatisticsProps {
  data: EmojiStatsData;
  lang: Language;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c43', '#a4de6c', '#d0ed57'];

export function EmojiStatistics({ data, lang }: EmojiStatisticsProps) {
  const tr = getTranslations(lang);
  
  if (!data || data.total_emojis === 0) {
    return null;
  }

  // Prepare data for top emojis chart
  const topEmojisData = data.top_emojis.slice(0, 15).map(item => ({
    name: item.emoji,
    count: item.count,
  }));

  // Prepare data for emojis by author
  const authorData = Object.entries(data.by_author).map(([author, stats]) => ({
    author,
    total: stats.total,
    unique: stats.unique,
    perMessage: stats.per_message,
  })).sort((a, b) => b.total - a.total);

  // Prepare pie chart data for author distribution
  const authorPieData = authorData.slice(0, 8).map(item => ({
    name: item.author,
    value: item.total,
  }));

  return (
    <div style={{ width: '100%', marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '20px' }}>{tr.emojiStatistics}</h3>
      
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
            {data.total_emojis.toLocaleString()}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>{tr.totalEmojis}</div>
        </div>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {data.unique_emojis}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>{tr.uniqueEmojis}</div>
        </div>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
            {data.emojis_per_message}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>{tr.emojisPerMessage}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        {/* Top Emojis Chart */}
        {topEmojisData.length > 0 && (
          <div style={{ height: '400px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>{tr.mostUsedEmojis}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEmojisData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={50}
                  tick={{ fontSize: 20 }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, tr.occurrences]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="count" fill="#8884d8" name={tr.occurrences} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Author Emoji Distribution Pie */}
        {authorPieData.length > 0 && (
          <div style={{ height: '400px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>{tr.emojisByAuthor}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={authorPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {authorPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, tr.emojis]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Emojis per Author Bar Chart */}
      {authorData.length > 0 && (
        <div style={{ height: '400px', marginBottom: '30px' }}>
          <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>{tr.emojisPerAuthor}</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={authorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="author" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name={tr.totalEmojis} />
              <Bar dataKey="unique" fill="#82ca9d" name={tr.uniqueEmojis} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Emojis per Author */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>{tr.favoriteEmojisByAuthor}</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px' 
        }}>
          {Object.entries(data.by_author).slice(0, 6).map(([author, stats]) => (
            <div 
              key={author}
              style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
                {author}
              </div>
              <div style={{ fontSize: '24px', letterSpacing: '4px' }}>
                {stats.top_emojis.slice(0, 5).map(e => e.emoji).join(' ')}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                {stats.total} {tr.emojis} • {stats.per_message} {tr.perMessage}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
