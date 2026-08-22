import { useState } from 'react';

function MessageBubble({ role, text }) {
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
