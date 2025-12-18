import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { BestemmiometroData } from '../../types';

interface BestemmiometroProps {
  data: BestemmiometroData;
}

// Language-specific labels
const labels = {
  it: {
    title: 'Bestemmiometro',
    total: 'Totale',
    per100msg: 'Per 100 msg',
    uniqueTypes: 'Tipi Diversi',
    climaxDetected: 'Climax Rilevati',
    top10Items: 'Top 10 Bestemmie',
    perCapita: 'Bestemmie per 100 Messaggi (Per Capita)',
    rate: 'Tasso',
    timeline: 'Andamento nel Tempo',
    itemName: 'Bestemmie',
    authorDetail: 'Dettaglio per Autore (Top 5 Bestemmie)',
    streakRecord: 'Record Bestemmie Consecutive',
    streakDesc: 'Messaggi consecutivi con bestemmie dallo stesso autore',
    climaxAnalysis: 'Analisi Climax',
    climaxDesc: 'Bestemmie con vocali ripetute (es: dioooo, madonnaaaa)',
    totalClimax: 'Totale Climax',
    avgIntensity: 'Intensità Media',
    ranking: 'Classifica Bestemmiatori',
    position: 'Pos',
    author: 'Autore',
    perCapitaShort: 'Per Capita',
    streak: 'Streak',
    date: 'Data',
    climaxExamples: 'Esempi di Climax Rilevati',
    climax: 'Climax',
    msg: 'msg',
  },
  en: {
    title: 'Swear-O-Meter',
    total: 'Total',
    per100msg: 'Per 100 msg',
    uniqueTypes: 'Unique Words',
    climaxDetected: 'Emphasis Found',
    top10Items: 'Top 10 Swear Words',
    perCapita: 'Swear Words per 100 Messages (Per Capita)',
    rate: 'Rate',
    timeline: 'Trend Over Time',
    itemName: 'Swear Words',
    authorDetail: 'Detail by Author (Top 5 Words)',
    streakRecord: 'Consecutive Swearing Records',
    streakDesc: 'Consecutive messages with swear words by the same author',
    climaxAnalysis: 'Emphasis Analysis',
    climaxDesc: 'Swear words with repeated letters (e.g., fuuuck, shiiiit)',
    totalClimax: 'Total Emphasis',
    avgIntensity: 'Avg Intensity',
    ranking: 'Swearers Ranking',
    position: 'Pos',
    author: 'Author',
    perCapitaShort: 'Per Capita',
    streak: 'Streak',
    date: 'Date',
    climaxExamples: 'Examples of Emphasized Words',
    climax: 'Emphasis',
    msg: 'msg',
  },
};

// Generate colors for phrases dynamically
const generateColor = (index: number): string => {
  const colors = [
    '#DC2626', '#B91C1C', '#7C3AED', '#EA580C', '#059669',
    '#2563EB', '#D97706', '#7C2D12', '#4338CA', '#BE185D',
    '#0D9488', '#65A30D', '#C026D3', '#0891B2', '#DB2777'
  ];
  return colors[index % colors.length];
};

export function Bestemmiometro({ data }: BestemmiometroProps) {
  // If no profanity found, don't render the section at all
  if (data.total === 0) {
    return null;
  }

  // Get language from data, default to Italian
  const lang = (data.language === 'en' ? 'en' : 'it') as keyof typeof labels;
  const t = labels[lang];

  // Get phrases that have counts > 0
  const phraseEntries = Object.entries(data.by_phrase)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  
  // Create color mapping for phrases
  const phraseColors: Record<string, string> = {};
  phraseEntries.forEach(([phrase], index) => {
    phraseColors[phrase] = generateColor(index);
  });

  // Prepare data for phrase pie chart (top 10)
  const phraseData = phraseEntries
    .slice(0, 10)
    .map(([phrase, count]) => ({
      name: phrase,
      value: count,
      color: phraseColors[phrase],
    }));

  // Prepare data for author bar chart
  const authorData = Object.entries(data.by_author_total)
    .sort((a, b) => b[1] - a[1])
    .map(([author, total]) => {
      const authorPhrases: Record<string, number | string> = { author, total };
      // Add each phrase count for this author
      Object.entries(data.by_author[author] || {}).forEach(([phrase, count]) => {
        authorPhrases[phrase] = count;
      });
      return authorPhrases;
    });

  // Prepare per-capita data
  const perCapitaData = Object.entries(data.per_capita)
    .sort((a, b) => b[1] - a[1])
    .map(([author, rate]) => ({
      author,
      rate,
      tooltip: `${rate} ${lang === 'it' ? 'bestemmie' : 'swear words'} per 100 ${lang === 'it' ? 'messaggi' : 'messages'}`
    }));

  // Prepare timeline data
  const timelineData = Object.entries(data.timeline)
    .map(([timestamp, count]) => ({
      timestamp: new Date(timestamp).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { month: 'short', day: 'numeric' }),
      count
    }));

  // Prepare consecutive streaks data
  const streakData = data.consecutive_streaks
    .slice(0, 5)
    .map((streak, index) => ({
      position: index + 1,
      author: streak.author,
      count: streak.count,
      date: streak.timestamp ? new Date(streak.timestamp).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US') : 'N/A'
    }));

  // Prepare climax intensity data
  const climaxByAuthor = Object.entries(data.climax_by_author)
    .sort((a, b) => b[1] - a[1])
    .map(([author, count]) => ({
      author,
      count
    }));

  // Top 5 phrases for the stacked bar chart
  const topPhrases = phraseEntries.slice(0, 5).map(([phrase]) => phrase);

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
        {t.title}
      </h3>
      
      {/* Summary Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#DC2626',
          borderRadius: '8px',
          color: 'white',
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.total}</div>
          <div style={{ fontSize: '14px' }}>{t.total}</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#B91C1C',
          borderRadius: '8px',
          color: 'white',
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.total_per_capita}</div>
          <div style={{ fontSize: '14px' }}>{t.per100msg}</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#7C3AED',
          borderRadius: '8px',
          color: 'white',
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{Object.keys(data.by_phrase).length}</div>
          <div style={{ fontSize: '14px' }}>{t.uniqueTypes}</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: '#EA580C',
          borderRadius: '8px',
          color: 'white',
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{data.climax_instances.length}</div>
          <div style={{ fontSize: '14px' }}>{t.climaxDetected}</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Pie Chart by Phrase */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{t.top10Items}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={phraseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => 
                  `${name.length > 15 ? name.slice(0, 12) + '...' : name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {phraseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Per Capita Bar Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{t.perCapita}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={perCapitaData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="author" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value} per 100 ${t.msg}`, t.rate]} />
              <Bar dataKey="rate" fill="#DC2626" name={t.perCapitaShort} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline */}
      {timelineData.length > 1 && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{t.timeline}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#DC2626" fill="#FECACA" name={t.itemName} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stacked Bar by Author */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{t.authorDetail}</h4>
        <ResponsiveContainer width="100%" height={Math.max(200, authorData.length * 40)}>
          <BarChart data={authorData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="author" type="category" width={100} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {topPhrases.map((phrase, index) => (
              <Bar 
                key={phrase}
                dataKey={phrase} 
                stackId="a" 
                fill={phraseColors[phrase] || generateColor(index)} 
                name={phrase}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Patterns Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Consecutive Streaks */}
        {streakData.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{t.streakRecord}</h4>
            <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '10px' }}>
              {t.streakDesc}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FEE2E2' }}>
                  <th style={{ padding: '8px', textAlign: 'center' }}>#</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>{t.author}</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>{t.streak}</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {streakData.map((streak) => (
                  <tr key={`${streak.author}-${streak.date}`}>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{streak.position}</td>
                    <td style={{ padding: '8px' }}>{streak.author}</td>
                    <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#DC2626' }}>
                      {streak.count} {t.msg}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>{streak.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Climax Pattern Analysis */}
        {data.climax_instances.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px' }}>
            <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{t.climaxAnalysis}</h4>
            <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '10px' }}>
              {t.climaxDesc}
            </p>
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>{t.totalClimax}:</span>
                <strong>{data.climax_instances.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t.avgIntensity}:</span>
                <strong>{data.avg_climax_intensity}/5</strong>
              </div>
            </div>
            {climaxByAuthor.length > 0 && (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={climaxByAuthor.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="author" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7C3AED" name={t.climax} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Ranking Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '15px' 
      }}>
        <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>{t.ranking}</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FEE2E2' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #FECACA' }}>{t.position}</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #FECACA' }}>{t.author}</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA' }}>{t.total}</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA' }}>{t.perCapitaShort}</th>
                {topPhrases.slice(0, 4).map(phrase => (
                  <th key={phrase} style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #FECACA', fontSize: '12px' }}>
                    {phrase.length > 12 ? phrase.slice(0, 10) + '..' : phrase}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {authorData.map((author, index) => (
                <tr key={author.author as string} style={{ backgroundColor: index % 2 === 0 ? '#FFF' : '#FEF2F2' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>
                    {index === 0 ? '1.' : index === 1 ? '2.' : index === 2 ? '3.' : `${index + 1}.`}
                  </td>
                  <td style={{ padding: '10px' }}>{author.author}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{author.total}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#DC2626' }}>
                    {data.per_capita[author.author as string] || 0}
                  </td>
                  {topPhrases.slice(0, 4).map(phrase => (
                    <td key={phrase} style={{ padding: '10px', textAlign: 'center' }}>
                      {(author[phrase] as number) || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Climax Examples */}
      {data.climax_instances.length > 0 && (
        <div style={{ 
          marginTop: '20px',
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '15px' 
        }}>
          <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{t.climaxExamples}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {data.climax_instances.slice(0, 10).map((climax, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '8px 12px', 
                  backgroundColor: `rgba(124, 58, 237, ${0.2 + climax.intensity * 0.15})`,
                  borderRadius: '20px',
                  fontSize: '14px',
                  border: '1px solid #7C3AED'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{climax.text}</span>
                <span style={{ marginLeft: '5px', fontSize: '12px', color: '#666' }}>
                  (x{climax.repetitions})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
