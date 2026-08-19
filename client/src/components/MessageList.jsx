import MessageBubble from './MessageBubble';

function MessageList({ messages = [] }) {
  if (!messages.length) {
    return <div className="empty-state">No messages yet. Start the conversation.</div>;
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <MessageBubble
          key={`${message.role}-${index}-${message.text}`}
          role={message.role}
          text={message.text}
        />
      ))}
    </div>
  );
}

export default MessageList;
