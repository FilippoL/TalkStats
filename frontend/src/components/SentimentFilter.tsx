interface SentimentFilterProps {
  selectedSentiment?: string;
  onSentimentChange: (sentiment?: string) => void;
}

const SENTIMENTS = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'joy', label: 'Joy' },
  { value: 'anger', label: 'Anger' },
  { value: 'sadness', label: 'Sadness' },
  { value: 'fear', label: 'Fear' },
];

export function SentimentFilter({ selectedSentiment, onSentimentChange }: SentimentFilterProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        Sentiment Filter:
      </label>
      <select
        value={selectedSentiment || ''}
        onChange={(e) => onSentimentChange(e.target.value || undefined)}
        style={{
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
          minWidth: '150px',
        }}
      >
        <option value="">All Sentiments</option>
        {SENTIMENTS.map(sentiment => (
          <option key={sentiment.value} value={sentiment.value}>
            {sentiment.label}
          </option>
        ))}
      </select>
    </div>
  );
}


