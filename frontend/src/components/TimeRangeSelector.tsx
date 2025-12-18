import { getTranslations, Language } from '../i18n/translations';

interface TimeRangeSelectorProps {
  timeGroup: string;
  onTimeGroupChange: (group: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  lang: Language;
}

export function TimeRangeSelector({
  timeGroup,
  onTimeGroupChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  lang,
}: TimeRangeSelectorProps) {
  const tr = getTranslations(lang);
  
  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {tr.timeGrouping}
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
          <option value="hour">{tr.hour}</option>
          <option value="day">{tr.day}</option>
          <option value="week">{tr.week}</option>
          <option value="month">{tr.month}</option>
        </select>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {tr.startDate}
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
          {tr.endDate}
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


