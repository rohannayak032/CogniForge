import { useEffect, useRef, useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('cogniforge-theme') || 'light');
  const messageListRef = useRef(null);

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

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('cogniforge-theme', theme);
  }, [theme]);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    setInputValue('');
    setError('');
    setIsLoading(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', text: trimmedInput },
    ]);

    try {
      const response = await sendMessage(userID, trimmedInput);

      setMessages((currentMessages) => [
        ...currentMessages,
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

  const handleSuggestedPrompt = (prompt) => {
    setInputValue(prompt);
  };

  return (
    <main className={`chat-shell ${isSidebarOpen ? '' : 'sidebar-collapsed'} theme-${theme}`}>
      <aside className="sidebar" aria-label="Workspace navigation">
        <div className="sidebar-header">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">C</div>
            {isSidebarOpen ? (
              <div>
                <p className="eyebrow">CogniForge</p>
                <p className="brand-name">AI workspace</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="icon-button sidebar-toggle"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <button type="button" className="new-chat-button" onClick={handleClear} disabled={isLoading}>
          <span className="new-chat-icon" aria-hidden="true">＋</span>
          {isSidebarOpen ? <span>New chat</span> : null}
        </button>

        {isSidebarOpen ? (
          <div className="sidebar-footer">
            <button type="button" className="settings-item" onClick={() => setIsSettingsOpen(true)}>
              <span aria-hidden="true">⚙</span>
              <span>Settings</span>
            </button>
            <p className="sidebar-caption">A focused space for thinking, building, and learning.</p>
          </div>
        ) : null}
      </aside>

      <section className="chat-window" aria-label="CogniForge chat">
        <header className="chat-header">
          <div className="brand-lockup">
            <div>
              <p className="eyebrow">Current conversation</p>
              <h1>Let’s build something thoughtful.</h1>
            </div>
          </div>
          <div className="connection-status">
            <span className="status-dot" aria-hidden="true" />
            <span>Ready to chat</span>
          </div>
        </header>

        {error && <div className="error-banner" role="alert">{error}</div>}

        {isLoading && !messages.length ? (
          <div className="loading-indicator">Loading conversation...</div>
        ) : null}

        <MessageList messages={messages} messageListRef={messageListRef} onSuggestedPrompt={handleSuggestedPrompt} />

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

        {isSettingsOpen ? (
          <div className="settings-backdrop" role="presentation" onMouseDown={() => setIsSettingsOpen(false)}>
            <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
              <div className="settings-panel-header">
                <div>
                  <p className="eyebrow">Preferences</p>
                  <h2 id="settings-title">Settings</h2>
                </div>
                <button type="button" className="icon-button" onClick={() => setIsSettingsOpen(false)} aria-label="Close settings">×</button>
              </div>
              <div className="theme-setting">
                <div>
                  <p className="setting-title">Appearance</p>
                  <p className="setting-description">Choose how CogniForge looks on this device.</p>
                </div>
                <div className="theme-toggle" role="group" aria-label="Theme">
                  <button type="button" className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}>Light</button>
                  <button type="button" className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}>Dark</button>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default ChatWindow;
