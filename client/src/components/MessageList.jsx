import MessageBubble from './MessageBubble';

function MessageList({ messages = [], messageListRef, onSuggestedPrompt }) {
  const suggestedPrompts = [
    'Explain a difficult concept',
    'Help me debug code',
    'Summarize my notes',
    'Quiz me on a topic',
  ];

  return (
    <div className="message-list" ref={messageListRef}>
      {messages.length ? (
        messages.map((message, index) => (
          <MessageBubble
            key={`${message.role}-${index}-${message.text}`}
            role={message.role}
            text={message.text}
            sources={message.sources}
          />
        ))
      ) : (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">✦</div>
          <p className="empty-title">What can I help you build?</p>
          <p className="empty-copy">Ask a question, explore an idea, or work through a problem.</p>
          <div className="suggested-prompts">
            {suggestedPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => onSuggestedPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;
