import { Link } from 'react-router-dom'

import LegalLink from './LegalLink'

const FOOTER_LINKS = [
  { slug: 'privacy', label: 'Política de privacidad' },
  { slug: 'terms', label: 'Términos de servicio' },
  { slug: 'contact', label: 'Contáctenos' },
  { slug: 'support', label: 'Soporte' },
]

export default function AppFooter({ variant = 'default' }) {
  return (
    <footer className={`sy-footer ${variant === 'systems' ? 'sy-footer--systems' : ''}`}>
      <div className="sy-footer__inner">
        <Link to="/" className="sy-logo sy-logo--blue sy-footer__logo">
          Salud<span>Ya</span>
        </Link>

        <nav className="sy-footer__links" aria-label="Pie de página">
          {FOOTER_LINKS.map((link) => (
            <LegalLink key={link.slug} slug={link.slug}>
              {link.label}
            </LegalLink>
          ))}
        </nav>

        <p className="sy-footer__copy">© 2026 SaludYa. Santuario de eficiencia.</p>
      </div>
    </footer>
  )
}
