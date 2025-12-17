interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}


