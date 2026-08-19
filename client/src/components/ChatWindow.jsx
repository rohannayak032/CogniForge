import { useEffect, useState } from 'react';
import { getHistory, sendMessage, clearHistory } from '../api/chat';
import { getOrCreateUserID } from '../utils/userId';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

function ChatWindow() {
  const [userID] = useState(() => getOrCreateUserID());
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getHistory(userID);
      setMessages(response?.messages || []);
    } catch (err) {
      setError(err.message || 'Unable to load the conversation right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [userID]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    setInputValue('');
    setError('');
    setIsLoading(true);

    try {
      const response = await sendMessage(userID, trimmedInput);

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'user', text: trimmedInput },
        { role: 'assistant', text: response?.reply || 'No response received.' },
      ]);
    } catch (err) {
      setError(err.message || 'Unable to send the message right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (isLoading) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await clearHistory(userID);
      setMessages([]);
    } catch (err) {
      setError(err.message || 'Unable to clear the conversation right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="chat-shell">
      <div className="chat-window">
        <header className="chat-header">
          <div>
            <p className="eyebrow">CogniForge</p>
            <h1>AI Chat</h1>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {isLoading && !messages.length ? (
          <div className="loading-indicator">Loading conversation...</div>
        ) : null}

        <MessageList messages={messages} />

        {isLoading && messages.length ? (
          <div className="typing-indicator">Thinking...</div>
        ) : null}

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onClear={handleClear}
          disabled={isLoading}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}

export default ChatWindow;
