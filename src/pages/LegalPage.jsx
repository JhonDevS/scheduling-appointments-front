import { Link, useParams } from 'react-router-dom'

import { getLegalPage } from '../utils/legalContent'

export default function LegalPage() {
  const { slug } = useParams()
  const page = getLegalPage(slug)

  if (!page) {
    return (
      <div className="sy-page sy-page--gray" style={{ padding: 48, textAlign: 'center' }}>
        <h1>Página no encontrada</h1>
        <Link to="/" className="sy-btn sy-btn--primary" style={{ marginTop: 16, display: 'inline-block' }}>
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="sy-page sy-page--gray">
      <main className="sy-app-main" style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link to="/" style={{ color: 'var(--sy-teal)', fontWeight: 600 }}>
          ← Volver
        </Link>
        <h1 style={{ marginTop: 16 }}>{page.title}</h1>
        {page.sections.map((section) => (
          <section key={section.heading} style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: '1.1rem' }}>{section.heading}</h2>
            <p style={{ color: 'var(--sy-text-muted)', lineHeight: 1.6 }}>{section.body}</p>
          </section>
        ))}
      </main>
    </div>
  )
}
