export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="sy-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={onClose} />
      <div className="sy-modal__panel" style={{ maxWidth: 440 }}>
        <header className="sy-modal__header">
          <h2 id="help-title">Centro de ayuda</h2>
          <button type="button" className="sy-modal__close" onClick={onClose} aria-label="Cerrar ventana">
            ×
          </button>
        </header>
        <div className="sy-modal__body">
          <p>
            Para reservar una cita use <strong>+ Nueva cita</strong>. Para gestionar pacientes, vaya a
            Gestión de pacientes. Si necesita soporte adicional, visite la página de Soporte en el pie de página.
          </p>
        </div>
        <footer className="sy-modal__footer">
          <button type="button" className="sy-btn sy-btn--primary sy-btn--block" onClick={onClose}>
            Entendido
          </button>
        </footer>
      </div>
    </div>
  )
}
