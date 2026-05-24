import { useState } from 'react'

import { useNavigate } from 'react-router-dom'



import HowItWorksModal from '../components/how-it-works/HowItWorksModal'

import AppFooter from '../components/layout/AppFooter'

import PublicNavbar from '../components/layout/PublicNavbar'

import { useNewsletterStore } from '../store/newsletterStore'



const FEATURES = [

  {

    title: 'Reserva fácil',

    text: 'Nuestro algoritmo intuitivo encuentra al especialista ideal para sus necesidades en menos de 30 segundos. Sin listas de espera, sin fricción.',

    variant: '',

  },

  {

    title: 'Disponibilidad 24/7',

    text: 'Soporte médico que nunca duerme. Acceda a su historial y programe visitas cuando la inspiración o la necesidad lo requieran.',

    variant: 'teal',

  },

  {

    title: 'Eficiencia primero',

    text: 'Recordatorios automáticos y registros sin contacto.',

    variant: 'small',

  },

  {

    title: 'Especialistas verificados',

    text: 'Más de 500 profesionales certificados a su alcance.',

    variant: 'small',

  },

]



const JOURNEY_STEPS = [

  { label: 'Seleccionar especialidad', active: true },

  { label: 'Elegir su horario', active: false },

  { label: 'Consulta virtual', active: false },

]



const HOW_SUMMARY = [

  {

    step: '1',

    title: 'Regístrese',

    text: 'Cree su cuenta en minutos con datos básicos y acceda como paciente, doctor o administrador.',

  },

  {

    step: '2',

    title: 'Reserve',

    text: 'Elija especialista, fecha y hora con confirmación inmediata y resumen antes de guardar.',

  },

  {

    step: '3',

    title: 'Gestione',

    text: 'Controle citas, salud y recetas desde su panel; reprograme o cancele cuando lo necesite.',

  },

]



export default function Landing() {

  const navigate = useNavigate()

  const subscribe = useNewsletterStore((s) => s.subscribe)

  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const [newsletterEmail, setNewsletterEmail] = useState('')

  const [newsletterMsg, setNewsletterMsg] = useState('')



  const openHowItWorks = () => {

    setShowHowItWorks(true)

  }



  const scrollToHowSection = () => {

    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })

  }



  const handleNewsletter = (e) => {

    e.preventDefault()

    const result = subscribe(newsletterEmail)

    if (result.success) {

      setNewsletterMsg('¡Gracias! Le contactaremos pronto.')

      setNewsletterEmail('')

    } else {

      setNewsletterMsg(result.error)

    }

  }



  return (

    <div className="sy-page">

      <PublicNavbar activePath="/" />

      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />



      <section className="sy-hero">

        <div>

          <span className="sy-badge">Redefiniendo el cuidado</span>

          <h1>

            Experimente una gestión de salud <em>serena</em>.

          </h1>

          <p className="sy-hero__text">

            SaludYa transforma la complejidad clínica en un santuario de eficiencia.

            Reserve, gestione y cuide lo que más importa con una interfaz diseñada para la calma.

          </p>

          <div className="sy-hero__actions">

            <button type="button" className="sy-btn sy-btn--primary sy-btn--lg" onClick={() => navigate('/book')}>

              Agendar su cita

            </button>

            <button

              type="button"

              className="sy-btn sy-btn--outline sy-btn--lg"

              onClick={openHowItWorks}

              aria-haspopup="dialog"

            >

              ▶ Cómo funciona

            </button>

          </div>

        </div>

        <div className="sy-hero__visual">

          <img

            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"

            alt="Consultorio médico moderno"

          />

          <div className="sy-hero__toast">

            <strong>Confirmación inmediata</strong>

            Su viaje de bienestar comienza ahora.

          </div>

        </div>

      </section>



      <section className="sy-how-section" id="como-funciona">

        <div className="sy-how-section__header">

          <span className="sy-badge">En tres pasos</span>

          <h2>Así funciona SaludYa</h2>

          <p>

            Un flujo pensado para que reserve, asista y haga seguimiento sin complicaciones.

            Pulse «Cómo funciona» arriba para ver la guía detallada con los seis pasos completos.

          </p>

          <button type="button" className="sy-btn sy-btn--primary" style={{ marginTop: 16 }} onClick={openHowItWorks}>

            Ver explicación completa

          </button>

        </div>

        <div className="sy-how-cards">

          {HOW_SUMMARY.map((item) => (

            <article key={item.step} className="sy-how-card">

              <div className="sy-how-card__icon">{item.step}</div>

              <h3>{item.title}</h3>

              <p>{item.text}</p>

            </article>

          ))}

        </div>

      </section>



      <section className="sy-section sy-section--alt" id="servicios">

        <h2>La precisión del arquitecto</h2>

        <p className="sy-section__lead">

          Diseñado para el paciente moderno que valora el tiempo tanto como la salud.

        </p>

        <div className="sy-features">

          <div className={`sy-feature-card ${FEATURES[0].variant === 'teal' ? 'sy-feature-card--teal' : ''}`}>

            <h3>{FEATURES[0].title}</h3>

            <p>{FEATURES[0].text}</p>

          </div>

          <div className="sy-feature-card sy-feature-card--teal">

            <h3>{FEATURES[1].title}</h3>

            <p>{FEATURES[1].text}</p>

          </div>

          <div className="sy-feature-row">

            <div className="sy-feature-card">

              <h3>{FEATURES[2].title}</h3>

              <p>{FEATURES[2].text}</p>

            </div>

            <div className="sy-feature-card">

              <h3>{FEATURES[3].title}</h3>

              <p>{FEATURES[3].text}</p>

            </div>

          </div>

        </div>

      </section>



      <section className="sy-section" id="doctores">

        <div className="sy-journey">

          <div>

            <h2>

              Su viaje de salud, <em style={{ color: 'var(--sy-teal)', fontStyle: 'normal' }}>arquitectado</em>.

            </h2>

            <ol className="sy-steps">

              {JOURNEY_STEPS.map((step) => (

                <li key={step.label} className={step.active ? 'is-active' : ''}>

                  {step.label}

                </li>

              ))}

            </ol>

            <button

              type="button"

              className="sy-btn sy-btn--outline"

              style={{ marginTop: 20 }}

              onClick={scrollToHowSection}

            >

              Más detalles del proceso

            </button>

          </div>

          <div className="sy-appointment-preview">

            <h4>Próxima cita</h4>

            <div className="sy-appointment-preview__card">

              <strong>Dra. Sarah Jenkins</strong>

              <p style={{ margin: '4px 0', color: 'var(--sy-text-muted)' }}>Especialista en cardiología</p>

              <span className="sy-status">CONFIRMADA</span>

              <p style={{ marginTop: 8 }}>Mañana, 10:00 AM</p>

            </div>

            <button type="button" className="sy-btn sy-btn--mint sy-btn--block" onClick={() => navigate('/book')}>

              Reprogramar

            </button>

          </div>

        </div>

      </section>



      <section className="sy-cta" id="acerca">

        <h2>¿Listo para una experiencia de salud más eficiente?</h2>

        <p>Únase a más de 10.000 pacientes que han encontrado su santuario de cuidado.</p>

        <form className="sy-cta__form" onSubmit={handleNewsletter}>

          <input

            type="email"

            placeholder="Su correo médico"

            aria-label="Correo médico"

            value={newsletterEmail}

            onChange={(e) => setNewsletterEmail(e.target.value)}

          />

          <button type="submit" className="sy-btn sy-btn--mint">

            Comenzar

          </button>

        </form>

        {newsletterMsg && (

          <p role="status" style={{ marginTop: 12, color: 'var(--sy-teal)' }}>

            {newsletterMsg}

          </p>

        )}

      </section>



      <AppFooter />

    </div>

  )

}

