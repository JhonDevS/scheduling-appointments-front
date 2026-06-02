export default function ValidationModal({
  isOpen,
  title = 'Mensaje de validación',
  messages = [],
  onClose,
}) {
  if (!isOpen || !messages?.length) return null

  return (
    <div className="sy-modal" role="dialog" aria-modal="true" aria-labelledby="validation-modal-title">
      <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <div className="sy-modal__panel" style={{ maxWidth: 520 }}>
        <header className="sy-modal__header">
          <h2 id="validation-modal-title">{title}</h2>
          <button type="button" className="sy-modal__close" onClick={onClose} aria-label="Cerrar ventana">
            ×
          </button>
        </header>
        <div className="sy-modal__body">
          <p className="sy-modal__intro">Por favor corrige los siguientes puntos antes de continuar:</p>
          <ul className="sy-validation-list">
            {messages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
        <footer className="sy-modal__footer">
          <button type="button" className="sy-btn sy-btn--primary sy-btn--block" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  )
}
