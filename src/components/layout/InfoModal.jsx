export default function InfoModal({
  isOpen,
  title = 'Operación exitosa',
  message,
  buttonLabel = 'Aceptar',
  onClose,
}) {
  if (!isOpen) return null

  return (
    <div className="sy-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
      <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <div className="sy-modal__panel" style={{ maxWidth: 440 }}>
        <header className="sy-modal__header">
          <h2 id="info-modal-title">{title}</h2>
          <button type="button" className="sy-modal__close" onClick={onClose} aria-label="Cerrar ventana">
            ×
          </button>
        </header>
        <div className="sy-modal__body">
          <p style={{ margin: 0, lineHeight: 1.7 }}>{message}</p>
        </div>
        <footer className="sy-modal__footer">
          <button type="button" className="sy-btn sy-btn--primary sy-btn--block" onClick={onClose}>
            {buttonLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
