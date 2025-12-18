import { useState, useEffect } from 'react';
import { useStats } from '../hooks/useStats';
import { getTranslations, Language } from '../i18n/translations';

interface AuthorSelectorProps {
  selectedAuthors: string[];
  onSelectionChange: (authors: string[]) => void;
  lang: Language;
}

export function AuthorSelector({ selectedAuthors, onSelectionChange, lang }: AuthorSelectorProps) {
  const { getAuthors } = useStats();
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const tr = getTranslations(lang);

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const authorList = await getAuthors();
        setAuthors(authorList);
      } catch (err) {
        console.error('Failed to fetch authors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const handleToggle = (author: string) => {
    if (selectedAuthors.includes(author)) {
      onSelectionChange(selectedAuthors.filter(a => a !== author));
    } else {
      onSelectionChange([...selectedAuthors, author]);
    }
  };

  if (loading) {
    return <div>{tr.loadingAuthors}</div>;
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
        {tr.authors}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {authors.map(author => (
          <label
            key={author}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: selectedAuthors.includes(author) ? '#007bff' : '#fff',
              color: selectedAuthors.includes(author) ? '#fff' : '#000',
            }}
          >
            <input
              type="checkbox"
              checked={selectedAuthors.includes(author)}
              onChange={() => handleToggle(author)}
              style={{ marginRight: '6px' }}
            />
            {author}
          </label>
        ))}
      </div>
    </div>
  );
}


