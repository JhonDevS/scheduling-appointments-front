import { Link } from 'react-router-dom'

export default function LegalLink({ slug, children, className, style }) {
  return (
    <Link to={`/legal/${slug}`} className={className} style={style}>
      {children}
    </Link>
  )
}
