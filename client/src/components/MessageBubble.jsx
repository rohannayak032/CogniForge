function MessageBubble({ role, text }) {
  const isUser = role === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        <span className="message-role">{isUser ? 'You' : 'Assistant'}</span>
        <p>{text || ''}</p>
      </div>
    </div>
  );
}

export default MessageBubble;
