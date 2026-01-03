import { useState, useEffect } from 'react';
import { getTranslations, Language } from '../i18n/translations';

// SVG Icons as components
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

interface AuthorSelectorProps {
  selectedAuthors: string[];
  onSelectionChange: (authors: string[]) => void;
  onMergeAuthors: (authorsToMerge: string[], mergedName: string) => void;
  onDeleteAuthor: (authorToDelete: string) => void;
  onReset?: () => void;
  hasModifications?: boolean;
  availableAuthors: string[];
  lang: Language;
}

export function AuthorSelector({ selectedAuthors, onSelectionChange, onMergeAuthors, onDeleteAuthor, onReset, hasModifications, availableAuthors, lang }: AuthorSelectorProps) {
  const [authors, setAuthors] = useState<string[]>(availableAuthors);
  const [_loading] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [authorsToMerge, setAuthorsToMerge] = useState<string[]>([]);
  const [mergeName, setMergeName] = useState('');
  const tr = getTranslations(lang);

  useEffect(() => {
    setAuthors(availableAuthors);
  }, [availableAuthors]);

  const handleRemoveAuthor = (authorToRemove: string) => {
    onSelectionChange(selectedAuthors.filter(a => a !== authorToRemove));
  };

  const handleDeleteAuthor = (authorToDelete: string) => {
    // Call parent callback to handle deletion
    onDeleteAuthor(authorToDelete);
  };

  const handleMergeToggle = (author: string) => {
    if (authorsToMerge.includes(author)) {
      setAuthorsToMerge(authorsToMerge.filter(a => a !== author));
    } else {
      setAuthorsToMerge([...authorsToMerge, author]);
    }
  };

  const handleMerge = () => {
    if (authorsToMerge.length < 2 || !mergeName.trim()) return;

    // Call parent callback to handle merging
    onMergeAuthors(authorsToMerge, mergeName.trim());

    // Reset merge state
    setMergeMode(false);
    setAuthorsToMerge([]);
    setMergeName('');
  };

  const cancelMerge = () => {
    setMergeMode(false);
    setAuthorsToMerge([]);
    setMergeName('');
  };

  if (loading) {
    return <div>{tr.loadingAuthors}</div>;
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <label style={{ fontWeight: 'bold' }}>
          {tr.authors}
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasModifications && onReset && (
            <button
              onClick={onReset}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {lang === 'it' ? 'Ripristina' : 'Reset'}
            </button>
          )}
          <button
            onClick={() => setMergeMode(!mergeMode)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: mergeMode ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {mergeMode ? tr.cancel : (lang === 'it' ? 'Unisci' : 'Merge')}
          </button>
        </div>
      </div>

      {/* Selected Authors with Remove Buttons */}
      {selectedAuthors.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
            {lang === 'it' ? 'Selezionati:' : 'Selected:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {selectedAuthors.map(author => (
              <div
                key={author}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {author}
                <button
                  onClick={() => handleRemoveAuthor(author)}
                  style={{
                    marginLeft: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    lineHeight: '1'
                  }}
                  title={lang === 'it' ? 'Rimuovi' : 'Remove'}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge UI */}
      {mergeMode && (
        <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            {lang === 'it' ? 'Seleziona autori da unire:' : 'Select authors to merge:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {authors.map(author => (
              <label
                key={author}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: authorsToMerge.includes(author) ? '#ffc107' : '#fff',
                  fontSize: '14px'
                }}
              >
                <input
                  type="checkbox"
                  checked={authorsToMerge.includes(author)}
                  onChange={() => handleMergeToggle(author)}
                  style={{ marginRight: '4px' }}
                />
                {author}
              </label>
            ))}
          </div>
          {authorsToMerge.length >= 2 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={lang === 'it' ? 'Nome dell\'autore unito' : 'Merged author name'}
                value={mergeName}
                onChange={(e) => setMergeName(e.target.value)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  flex: '1'
                }}
              />
              <button
                onClick={handleMerge}
                disabled={!mergeName.trim()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: mergeName.trim() ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: mergeName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                {lang === 'it' ? 'Unisci' : 'Merge'}
              </button>
              <button
                onClick={cancelMerge}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {tr.cancel}
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {authors.map(author => (
          <div key={author} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <label
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
                onChange={() => {
                  if (selectedAuthors.includes(author)) {
                    onSelectionChange(selectedAuthors.filter(a => a !== author));
                  } else {
                    onSelectionChange([...selectedAuthors, author]);
                  }
                }}
                style={{ marginRight: '6px' }}
              />
              {author}
            </label>
            <button
              onClick={() => handleDeleteAuthor(author)}
              style={{
                padding: '4px 6px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={lang === 'it' ? 'Elimina autore' : 'Delete author'}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
