import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BestemmiometroData } from '../../types';

interface BestemmiometroProps {
  data: BestemmiometroData;
}

interface AuthorBestemmiometroData {
  author: string;
  total: number;
  'porco dio': number;
  'dio porco': number;
  'porca madonna': number;
  'dio cane': number;
}

const PHRASE_COLORS: Record<string, string> = {
  'porco dio': '#DC2626',      // Red
  'dio porco': '#B91C1C',      // Dark Red
  'porca madonna': '#7C3AED',  // Purple
  'dio cane': '#EA580C',       // Orange
};

export function Bestemmiometro({ data }: BestemmiometroProps) {
  if (data.total === 0) {
    return (
      <div style={{ 
        width: '100%', 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        border: '2px solid #86efac',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '10px', fontSize: '24px' }}>Bestemmiometro</h3>
        <p style={{ color: '#166534', fontSize: '18px' }}>
          Nessuna bestemmia trovata! Chat pulita!
        </p>
      </div>
    );
  }

  // Prepare data for phrase pie chart
  const phraseData = Object.entries(data.by_phrase)
    .filter(([_, count]) => count > 0)
    .map(([phrase, count]) => ({
      name: phrase,
      value: count,
      color: PHRASE_COLORS[phrase] || '#666',
    }));

  // Prepare data for author bar chart
  const authorData: AuthorBestemmiometroData[] = Object.entries(data.by_author_total)
    .sort((a, b) => b[1] - a[1])
    .map(([author, total]) => ({
      author,
      total,
      'porco dio': data.by_author[author]?.['porco dio'] || 0,
      'dio porco': data.by_author[author]?.['dio porco'] || 0,
      'porca madonna': data.by_author[author]?.['porca madonna'] || 0,
      'dio cane': data.by_author[author]?.['dio cane'] || 0,
    }));

  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: '#FEF2F2', 
      borderRadius: '12px', 
      padding: '20px',
      border: '2px solid #FECACA',
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        marginBottom: '20px', 
        fontSize: '24px', 
        textAlign: 'center',
        color: '#991B1B'
      }}>
        Bestemmiometro
      </h3>
      
      {/* Total Counter */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#DC2626',
        borderRadius: '8px',
        color: 'white',
      }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{data.total}</div>
        <div style={{ fontSize: '18px' }}>Bestemmie Totali</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pie Chart by Phrase */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>Per Tipologia</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={phraseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: { name: string; value: number; percent: number }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {phraseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart by Author */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>Per Autore</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={authorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="author" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="porco dio" stackId="a" fill={PHRASE_COLORS['porco dio']} name="Porco Dio" />
              <Bar dataKey="dio porco" stackId="a" fill={PHRASE_COLORS['dio porco']} name="Dio Porco" />
              <Bar dataKey="porca madonna" stackId="a" fill={PHRASE_COLORS['porca madonna']} name="Porca Madonna" />
              <Bar dataKey="dio cane" stackId="a" fill={PHRASE_COLORS['dio cane']} name="Dio Cane" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking Table */}
      <div style={{ 
        marginTop: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '15px' 
      }}>
        <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>Classifica Bestemmiatori</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FEE2E2' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #FECACA' }}>Posizione</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #FECACA' }}>Autore</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA' }}>Porco Dio</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA' }}>Dio Porco</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA' }}>Porca Madonna</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA' }}>Dio Cane</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA' }}>Totale</th>
            </tr>
          </thead>
          <tbody>
            {authorData.map((author, index) => (
              <tr key={author.author} style={{ backgroundColor: index % 2 === 0 ? '#FFF' : '#FEF2F2' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                  {index + 1}.
                </td>
                <td style={{ padding: '10px' }}>{author.author}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{author['porco dio'] || 0}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{author['dio porco'] || 0}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{author['porca madonna'] || 0}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{author['dio cane'] || 0}</td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{author.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
