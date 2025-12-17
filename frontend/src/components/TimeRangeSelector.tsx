interface TimeRangeSelectorProps {
  timeGroup: string;
  onTimeGroupChange: (group: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function TimeRangeSelector({
  timeGroup,
  onTimeGroupChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: TimeRangeSelectorProps) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Time Grouping:
        </label>
        <select
          value={timeGroup}
          onChange={(e) => onTimeGroupChange(e.target.value)}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="hour">Hour</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Start Date:
        </label>
        <input
          type="date"
          value={startDate || ''}
          onChange={(e) => onStartDateChange(e.target.value)}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          End Date:
        </label>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => onEndDateChange(e.target.value)}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
}


