import React from 'react';
import { TimeSeriesDataPoint } from '../../types';

interface ActivityHeatmapProps {
  data: TimeSeriesDataPoint[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Group by day of week and hour
  const heatmapData: { [key: string]: number } = {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  data.forEach(point => {
    const date = new Date(point.timestamp);
    const dayOfWeek = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Convert Sunday=0 to Sunday=6
    const hour = date.getHours();
    const key = `${dayOfWeek}-${hour}`;
    heatmapData[key] = (heatmapData[key] || 0) + point.value;
  });

  // Create grid data
  const gridData: Array<{ day: string; hour: number; value: number }> = [];
  days.forEach(day => {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      gridData.push({
        day,
        hour,
        value: heatmapData[key] || 0,
      });
    }
  });

  // Find max value for color scaling
  const maxValue = Math.max(...gridData.map(d => d.value), 1);

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity === 0) return '#f0f0f0';
    if (intensity < 0.2) return '#cfe2f3';
    if (intensity < 0.4) return '#9fc5e8';
    if (intensity < 0.6) return '#6fa8dc';
    if (intensity < 0.8) return '#3d85c6';
    return '#0b5394';
  };

  return (
    <div style={{ width: '100%', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '10px' }}>Activity Heatmap (Day of Week vs Hour)</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto repeat(24, 1fr)',
        gap: '2px',
        fontSize: '10px',
      }}>
        {/* Header row */}
        <div style={{ padding: '4px', fontWeight: 'bold' }}></div>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} style={{ padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
            {i}
          </div>
        ))}
        
        {/* Data rows */}
        {days.map(day => (
          <React.Fragment key={day}>
            <div style={{ padding: '4px', fontWeight: 'bold', fontSize: '11px' }}>
              {day.substring(0, 3)}
            </div>
            {Array.from({ length: 24 }, (_, hour) => {
              const cellData = gridData.find(d => d.day === day && d.hour === hour);
              const value = cellData?.value || 0;
              return (
                <div
                  key={`${day}-${hour}`}
                  style={{
                    backgroundColor: getColor(value),
                    padding: '4px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    minWidth: '20px',
                  }}
                  title={`${day} ${hour}:00 - ${value} messages`}
                >
                  {value > 0 ? value : ''}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

