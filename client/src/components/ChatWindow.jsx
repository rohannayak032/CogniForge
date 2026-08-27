import { useEffect, useRef, useState } from 'react';
import { createConversation, deleteConversation, getConversations, getHistory, sendMessage, clearHistory } from '../api/chat';
import { askDocument, deleteDocument, getDocuments, uploadDocument } from '../api/documents';
import { getOrCreateUserID } from '../utils/userId';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import DocumentControls from './DocumentControls';
import ConversationList from './ConversationList';

async function loadConversationMessages(conversationID, userID, setMessages, setIsLoading, setError) {
  setIsLoading(true);
  setError('');

  try {
    const response = await getHistory(conversationID, userID);
    setMessages(response?.conversation?.messages || response?.messages || []);
  } catch (err) {
    setError(err.message || 'Unable to load the conversation right now.');
  } finally {
    setIsLoading(false);
  }
}

function ChatWindow() {
  const [userID] = useState(() => getOrCreateUserID());
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationID, setActiveConversationID] = useState(null);
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
  const activeConversation = conversations.find((conversation) => conversation.conversationID === activeConversationID);

  useEffect(() => {
    let isCurrent = true;

    getConversations(userID).then(async (response) => {
      if (!isCurrent) return;

      const availableConversations = response?.conversations || [];
      if (availableConversations.length) {
        setConversations(availableConversations);
        setActiveConversationID(availableConversations[0].conversationID);
        await loadConversationMessages(availableConversations[0].conversationID, userID, setMessages, setIsLoading, setError);
        return;
      }

      const createdResponse = await createConversation(userID);
      const conversation = createdResponse?.conversation;
      if (!isCurrent || !conversation?.conversationID) return;
      setConversations([conversation]);
      setActiveConversationID(conversation.conversationID);
      setMessages([]);
      setIsLoading(false);
    }).catch((err) => {
      if (isCurrent) {
        setError(err.message || 'Unable to load conversations right now.');
        setIsLoading(false);
      }
    });

    return () => {
      isCurrent = false;
    };
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

    if (!trimmedInput || isLoading || isUploading || (mode === 'document' && document?.status !== 'ready')) return;

    setInputValue('');
    setError('');
    setIsLoading(true);
    setMessages((currentMessages) => [...currentMessages, { role: 'user', text: trimmedInput }]);

    try {
      const response = mode === 'document'
        ? await askDocument(userID, trimmedInput, document._id)
        : await sendMessage(userID, trimmedInput, activeConversationID);

      if (mode === 'general' && response?.conversationID) setActiveConversationID(response.conversationID);
      if (mode === 'general') {
        const conversationsResponse = await getConversations(userID);
        setConversations(conversationsResponse?.conversations || []);
      }

      setMessages((currentMessages) => [...currentMessages, {
        role: 'assistant',
        text: response?.answer || response?.reply || 'No response received.',
        sources: mode === 'document' ? response?.sources || [] : undefined,
      }]);
    } catch (err) {
      setError(err.message || 'Unable to send the message right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    if (isLoading || isUploading) return;

    setError('');
    setIsLoading(true);
    try {
      const response = await createConversation(userID);
      const conversation = response?.conversation;
      if (!conversation?.conversationID) throw new Error('Unable to create a conversation.');
      setConversations((currentConversations) => [conversation, ...currentConversations]);
      setActiveConversationID(conversation.conversationID);
      setMessages([]);
      setMode('general');
    } catch (err) {
      setError(err.message || 'Unable to create a conversation right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversationID) => {
    if (conversationID === activeConversationID || isLoading || isUploading) return;
    setActiveConversationID(conversationID);
    setMode('general');
    await loadConversationMessages(conversationID, userID, setMessages, setIsLoading, setError);
  };

  const handleDeleteConversation = async (conversation) => {
    if (isLoading || isUploading || !window.confirm(`Delete ${conversation.title || 'this conversation'}?`)) return;

    setError('');
    setIsLoading(true);
    try {
      await deleteConversation(conversation.conversationID, userID);
      const remainingConversations = conversations.filter((item) => item.conversationID !== conversation.conversationID);
      if (remainingConversations.length) {
        setConversations(remainingConversations);
        const nextConversation = remainingConversations[0];
        setActiveConversationID(nextConversation.conversationID);
        await loadConversationMessages(nextConversation.conversationID, userID, setMessages, setIsLoading, setError);
      } else {
        const response = await createConversation(userID);
        const replacement = response?.conversation;
        setConversations(replacement ? [replacement] : []);
        setActiveConversationID(replacement?.conversationID || null);
        setMessages([]);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Unable to delete the conversation right now.');
      setIsLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

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
    if (isLoading) return;
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

  const handleSuggestedPrompt = (prompt) => setInputValue(prompt);

  return (
    <main className={`chat-shell ${isSidebarOpen ? '' : 'sidebar-collapsed'} theme-${theme}`}>
      <aside className="sidebar" aria-label="Workspace navigation">
        <div className="sidebar-header">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">C</div>
            {isSidebarOpen ? <div><p className="eyebrow">CogniForge</p><p className="brand-name">AI workspace</p></div> : null}
          </div>
          <button type="button" className="icon-button sidebar-toggle" onClick={() => setIsSidebarOpen((isOpen) => !isOpen)} aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            {isSidebarOpen ? '‹' : '›'}
          </button>
        </div>

        <button type="button" className="new-chat-button" onClick={handleNewConversation} disabled={isLoading}>
          <span className="new-chat-icon" aria-hidden="true">＋</span>
          {isSidebarOpen ? <span>New chat</span> : null}
        </button>

        {isSidebarOpen ? <ConversationList conversations={conversations} activeConversationID={activeConversationID} isLoading={isLoading} onSelect={handleSelectConversation} onNew={handleNewConversation} onDelete={handleDeleteConversation} /> : null}
        {isSidebarOpen ? <DocumentControls documents={documents} document={document} mode={mode} isUploading={isUploading} onModeChange={setMode} onUpload={handleUpload} onSelect={handleSelectDocument} onDelete={handleDeleteDocument} /> : null}

        {isSidebarOpen ? <div className="sidebar-footer">
          <button type="button" className="settings-item" onClick={() => setIsSettingsOpen(true)}><span aria-hidden="true">⚙</span><span>Settings</span></button>
          <p className="sidebar-caption">A focused space for thinking, building, and learning.</p>
        </div> : null}
      </aside>

      <section className="chat-window" aria-label="CogniForge chat">
        <header className="chat-header">
          <div className="brand-lockup"><div><p className="eyebrow">Current conversation</p><h1>{activeConversation?.title || 'Let’s build something thoughtful.'}</h1></div></div>
          <div className="connection-status"><span className="status-dot" aria-hidden="true" /><span>Ready to chat</span></div>
        </header>
        {error && <div className="error-banner" role="alert">{error}</div>}
        {isLoading && !messages.length ? <div className="loading-indicator">Loading conversation...</div> : null}
        <MessageList messages={messages} messageListRef={messageListRef} onSuggestedPrompt={handleSuggestedPrompt} />
        {isLoading && messages.length ? <div className="typing-indicator">Thinking...</div> : null}
        <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSend} onClear={handleClear} disabled={isLoading || isUploading || (mode === 'document' && document?.status !== 'ready')} isLoading={isLoading || isUploading} mode={mode} documentName={document?.originalName} />

        {isSettingsOpen ? <div className="settings-backdrop" role="presentation" onMouseDown={() => setIsSettingsOpen(false)}>
          <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="settings-panel-header"><div><p className="eyebrow">Preferences</p><h2 id="settings-title">Settings</h2></div><button type="button" className="icon-button" onClick={() => setIsSettingsOpen(false)} aria-label="Close settings">×</button></div>
            <div className="theme-setting"><div><p className="setting-title">Appearance</p><p className="setting-description">Choose how CogniForge looks on this device.</p></div><div className="theme-toggle" role="group" aria-label="Theme"><button type="button" className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}>Light</button><button type="button" className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}>Dark</button></div></div>
          </section>
        </div> : null}
      </section>
    </main>
  );
}

export default ChatWindow;
