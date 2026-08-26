import { useState } from 'react';

function MessageBubble({ role, text, sources = [] }) {
  const isUser = role === 'user';
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || '');
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  const formattedText = (text || '').split('\n').map((line, index) => (
    <span key={`${line}-${index}`}>
      {index ? <br /> : null}
      {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${part}-${partIndex}`}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={`${part}-${partIndex}`}>{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </span>
  ));

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        <span className="message-role">{isUser ? 'You' : 'Assistant'}</span>
        <p>{formattedText}</p>
        {!isUser && sources.length ? (
          <div className="message-sources">
            <span className="sources-label">Sources</span>
            {sources.map((source) => (
              <div className="source-item" key={`${source.documentId}-${source.pageNumber}-${source.chunkIndex}`}>
                <strong>{source.documentName}</strong>
                <span>Page {source.pageNumber} · Chunk {source.chunkIndex} · Score {Number(source.score || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : null}
        {!isUser ? (
          <button type="button" className="copy-button" onClick={handleCopy} aria-label="Copy assistant response">
            <span aria-hidden="true">{isCopied ? '✓' : '□'}</span>
            {isCopied ? 'Copied' : 'Copy'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default MessageBubble;
