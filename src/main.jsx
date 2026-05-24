import { GoogleOAuthProvider } from '@react-oauth/google'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function Root() {
  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )

  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId} locale="es">
        {app}
      </GoogleOAuthProvider>
    )
  }

  return app
}

createRoot(document.getElementById('root')).render(<Root />)
