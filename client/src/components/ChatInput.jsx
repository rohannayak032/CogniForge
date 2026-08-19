function ChatInput({ value, onChange, onSend, onClear, disabled, isLoading }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input-shell">
      <div className="chat-input-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onClear}
          disabled={disabled}
        >
          Clear conversation
        </button>
      </div>

      <div className="composer">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message..."
          disabled={disabled}
        />

        <button
          type="button"
          className="send-button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
