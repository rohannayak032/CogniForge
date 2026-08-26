import { useEffect, useRef, useState } from 'react';
import { getHistory, sendMessage, clearHistory } from '../api/chat';
import { askDocument, deleteDocument, getDocuments, uploadDocument } from '../api/documents';
import { getOrCreateUserID } from '../utils/userId';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import DocumentControls from './DocumentControls';

function ChatWindow() {
  const [userID] = useState(() => getOrCreateUserID());
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('cogniforge-theme') || 'light');
  const [mode, setMode] = useState('general');
  const [document, setDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
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
    getDocuments(userID).then((response) => {
      const availableDocuments = response?.documents || [];
      setDocuments(availableDocuments);
      setDocument(availableDocuments.find((item) => item.status === 'ready') || null);
    }).catch((err) => setError(err.message || 'Unable to load documents right now.'));
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

    if (!trimmedInput || isLoading || isUploading || (mode === 'document' && document?.status !== 'ready')) {
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
      const response = mode === 'document'
        ? await askDocument(userID, trimmedInput, document._id)
        : await sendMessage(userID, trimmedInput);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          text: response?.answer || response?.reply || 'No response received.',
          sources: mode === 'document' ? response?.sources || [] : undefined,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Unable to send the message right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');
    setIsUploading(true);
    setDocument({ originalName: file.name, status: 'processing' });

    try {
      const response = await uploadDocument(userID, file);
      const uploadedDocument = response?.document || { originalName: file.name, status: 'ready' };
      setDocuments((currentDocuments) => [uploadedDocument, ...currentDocuments]);
      setDocument(uploadedDocument);
      setMode('document');
    } catch (err) {
      setDocument(null);
      setError(err.message || 'Unable to upload and process the PDF right now.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectDocument = (selectedDocument) => {
    setDocument(selectedDocument);
    setMode('document');
    setError('');
  };

  const handleDeleteDocument = async (documentID) => {
    if (isLoading || isUploading) return;
    const deletedDocument = documents.find((item) => item._id === documentID);
    setError('');
    try {
      await deleteDocument(userID, documentID);
      const remainingDocuments = documents.filter((item) => item._id !== documentID);
      setDocuments(remainingDocuments);
      if (document?._id === documentID) {
        const nextDocument = remainingDocuments.find((item) => item.status === 'ready') || null;
        setDocument(nextDocument);
        if (!nextDocument) setMode('general');
      }
    } catch (err) {
      setError(err.message || `Unable to delete ${deletedDocument?.originalName || 'document'}.`);
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
          <DocumentControls
            documents={documents}
            document={document}
            mode={mode}
            isUploading={isUploading}
            onModeChange={setMode}
            onUpload={handleUpload}
            onSelect={handleSelectDocument}
            onDelete={handleDeleteDocument}
          />
        ) : null}

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
          disabled={isLoading || isUploading || (mode === 'document' && document?.status !== 'ready')}
          isLoading={isLoading || isUploading}
          mode={mode}
          documentName={document?.originalName}
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
