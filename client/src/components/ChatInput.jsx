function ChatInput({ value, onChange, onSend, onClear, disabled, isLoading }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input-shell">
      <div className="composer-toolbar">
        <span className="composer-label">Message CogniForge</span>
        <button
          type="button"
          className="secondary-button"
          onClick={onClear}
          disabled={disabled}
        >
          <span aria-hidden="true">↺</span>
          Clear chat
        </button>
      </div>

      <div className="composer">
        <textarea
          aria-label="Message CogniForge"
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
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
          <span className="send-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
