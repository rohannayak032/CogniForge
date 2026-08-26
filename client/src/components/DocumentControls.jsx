function DocumentControls({ documents, document, mode, isUploading, onModeChange, onUpload, onSelect, onDelete }) {
  const isReady = document?.status === 'ready';

  return (
    <section className="document-controls" aria-label="Document workspace">
      <p className="sidebar-label">Workspace mode</p>
      <div className="mode-toggle" role="group" aria-label="Workspace mode">
        <button type="button" className={mode === 'general' ? 'selected' : ''} onClick={() => onModeChange('general')}>
          General Chat
        </button>
        <button type="button" className={mode === 'document' ? 'selected' : ''} onClick={() => onModeChange('document')}>
          Document
        </button>
      </div>

      <label className={`document-upload ${isUploading ? 'is-uploading' : ''}`}>
        <input type="file" accept="application/pdf" onChange={onUpload} disabled={isUploading} />
        <span aria-hidden="true">↑</span>
        <span>{isUploading ? 'Processing PDF...' : 'Upload a PDF'}</span>
      </label>

      <div className="document-library">
        <p className="sidebar-label">Your documents</p>
        {documents.length ? documents.map((item) => (
          <div className={`library-item ${item._id === document?._id ? 'active' : ''}`} key={item._id}>
            <button type="button" onClick={() => onSelect(item)} disabled={item.status !== 'ready'}>
              <strong>{item.originalName}</strong>
              <span>{item.status === 'ready' ? `${item.pageCount} pages` : 'Processing...'}</span>
            </button>
            <button type="button" className="delete-document" onClick={() => onDelete(item._id)} aria-label={`Delete ${item.originalName}`} title="Delete document">×</button>
          </div>
        )) : <p className="document-hint">No documents uploaded yet.</p>}
      </div>

      {document ? (
        <div className={`active-document ${isReady ? 'ready' : ''}`}>
          <span className="document-status" aria-hidden="true" />
          <div>
            <strong>{document.originalName}</strong>
            <span>{isReady ? `${document.pageCount} pages · Ready` : 'Processing...'}</span>
          </div>
        </div>
      ) : (
        <p className="document-hint">Upload a document to ask grounded questions.</p>
      )}
    </section>
  );
}

export default DocumentControls;
