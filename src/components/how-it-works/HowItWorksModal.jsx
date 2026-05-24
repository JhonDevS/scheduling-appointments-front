import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    number: '01',
    title: 'Cree su cuenta o inicie sesión',
    description:
      'Regístrese con su número de identificación, nombre, correo y teléfono. Si ya es miembro, ingrese con su correo y contraseña. Puede acceder como paciente, doctor o administrador según su rol.',
    detail: 'Sus datos médicos se protegen según nuestra política de privacidad y estándares de seguridad clínica.',
  },
  {
    number: '02',
    title: 'Seleccione la especialidad y al especialista',
    description:
      'Navegue por departamentos médicos curados (cardiología, neurología, medicina general, etc.) y elija al profesional que mejor se adapte a su necesidad.',
    detail: 'Cada especialista muestra valoración, reseñas y disponibilidad en tiempo real (actualizada cada pocos segundos).',
  },
  {
    number: '03',
    title: 'Elija fecha y horario',
    description:
      'Use el calendario interactivo para ver días disponibles y seleccione un bloque horario de mañana o tarde que encaje con su agenda.',
    detail: 'Verá un resumen de la cita antes de confirmar: fecha, hora, médico y tipo de consulta.',
  },
  {
    number: '04',
    title: 'Confirme su cita',
    description:
      'Al pulsar «Confirmar cita», recibirá confirmación inmediata. No se requiere pago hasta el día de la visita en la mayoría de los casos.',
    detail: 'Se aceptan los principales seguros. Puede cancelar sin costo hasta 24 horas antes.',
  },
  {
    number: '05',
    title: 'Gestione todo desde su panel',
    description:
      'En «Mis citas» y el panel de control verá próximas consultas, historial, recetas activas y un resumen de salud (frecuencia cardíaca, presión, peso).',
    detail: 'Puede reprogramar, descargar historial en PDF y recibir recordatorios automáticos.',
  },
  {
    number: '06',
    title: 'Consulta presencial o virtual',
    description:
      'Según el servicio elegido, asista a la clínica con su documento e historial médico o conéctese por videollamada integrada en la plataforma.',
    detail: 'Los médicos usan el portal para cronogramas, nuevos pacientes y bloques de disponibilidad.',
  },
]

const HIGHLIGHTS = [
  { title: 'Sin listas de espera innecesarias', text: 'El algoritmo sugiere al especialista adecuado en menos de 30 segundos.' },
  { title: 'Disponible cuando usted lo necesite', text: 'Acceda a citas e historial 24 horas al día, los 7 días de la semana.' },
  { title: 'Eficiencia y tranquilidad', text: 'Recordatorios, check-in sin fricción y más de 500 especialistas verificados.' },
]

export default function HowItWorksModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="sy-modal" role="dialog" aria-modal="true" aria-labelledby="how-it-works-title">
      <button type="button" className="sy-modal__backdrop" aria-label="Cerrar" onClick={onClose} />

      <div className="sy-modal__panel">
        <header className="sy-modal__header">
          <div>
            <span className="sy-badge">Guía paso a paso</span>
            <h2 id="how-it-works-title">¿Cómo funciona SaludYa?</h2>
            <p className="sy-modal__intro">
              SaludYa convierte la gestión clínica en un proceso simple: desde el registro hasta
              el seguimiento post-consulta. Así es el recorrido completo en la plataforma.
            </p>
          </div>
          <button type="button" className="sy-modal__close" onClick={onClose} aria-label="Cerrar ventana">
            ×
          </button>
        </header>

        <div className="sy-modal__body">
          <ol className="sy-how-steps">
            {STEPS.map((step) => (
              <li key={step.number} className="sy-how-step">
                <span className="sy-how-step__num">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <p className="sy-how-step__detail">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className="sy-how-highlights">
            <h3>¿Por qué usar SaludYa?</h3>
            <div className="sy-how-highlights__grid">
              {HIGHLIGHTS.map((item) => (
                <article key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="sy-how-faq">
            <h3>Preguntas frecuentes</h3>
            <dl>
              <div>
                <dt>¿Necesito pagar al reservar?</dt>
                <dd>
                  En la mayoría de los casos no. El pago o copago se gestiona en la clínica el día
                  de la consulta, salvo que su especialista indique lo contrario.
                </dd>
              </div>
              <div>
                <dt>¿Puedo cambiar o cancelar una cita?</dt>
                <dd>
                  Sí. Desde «Mis citas» puede reprogramar o cancelar sin costo hasta 24 horas antes
                  del horario acordado.
                </dd>
              </div>
              <div>
                <dt>¿Soy médico o administrador?</dt>
                <dd>
                  Al iniciar sesión elija el rol correspondiente. Los doctores acceden al portal
                  médico (cronograma y pacientes); los administradores gestionan usuarios y permisos.
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <footer className="sy-modal__footer">
          <button type="button" className="sy-btn sy-btn--outline" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="sy-btn sy-btn--outline" onClick={() => { onClose(); navigate('/register') }}>
            Crear cuenta
          </button>
          <button
            type="button"
            className="sy-btn sy-btn--primary"
            onClick={() => { onClose(); navigate('/book') }}
          >
            Agendar mi primera cita
          </button>
        </footer>
      </div>
    </div>
  )
}
