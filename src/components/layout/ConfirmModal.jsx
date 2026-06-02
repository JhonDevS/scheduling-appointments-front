export default function ConfirmModal({
  isOpen,
  title = 'Confirmación',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div className="sy-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={onCancel} />
      <div className="sy-modal__panel" style={{ maxWidth: 420 }}>
        <header className="sy-modal__header">
          <h2 id="confirm-title">{title}</h2>
          <button type="button" className="sy-modal__close" onClick={onCancel} aria-label="Cerrar ventana">
            ×
          </button>
        </header>
        <div className="sy-modal__body">
          <p style={{ margin: 0, lineHeight: 1.7 }}>{message}</p>
        </div>
        <footer className="sy-modal__footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="sy-btn sy-btn--outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="sy-btn sy-btn--ghost"
            style={{ backgroundColor: 'var(--sy-danger)', color: '#fff', borderColor: 'transparent' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
