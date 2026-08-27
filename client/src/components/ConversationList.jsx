function ConversationList({ conversations, activeConversationID, isLoading, onSelect, onNew, onDelete }) {
  return (
    <section className="conversation-list" aria-label="Conversations">
      <div className="conversation-list-header">
        <p className="sidebar-label">Conversations</p>
        <button type="button" className="conversation-add" onClick={onNew} disabled={isLoading} aria-label="New chat" title="New chat">
          ＋
        </button>
      </div>

      {conversations.length ? conversations.map((conversation) => (
        <div className={`conversation-entry ${conversation.conversationID === activeConversationID ? 'active' : ''}`} key={conversation.conversationID}>
          <button
            type="button"
            className="conversation-item"
            onClick={() => onSelect(conversation.conversationID)}
            disabled={isLoading}
          >
            <span className="conversation-dot" aria-hidden="true" />
            <span className="conversation-title">{conversation.title || 'New conversation'}</span>
          </button>
          <button
            type="button"
            className="delete-conversation"
            onClick={() => onDelete(conversation)}
            disabled={isLoading}
            aria-label={`Delete ${conversation.title || 'conversation'}`}
            title="Delete conversation"
          >
            ×
          </button>
        </div>
      )) : (
        <p className="conversation-empty">No conversations yet.</p>
      )}
    </section>
  );
}

export default ConversationList;