import { PublicClientApplication } from '@azure/msal-browser'

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID || ''

export const msalConfig = {
  auth: {
    clientId,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
}

export const msalLoginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
}

let msalInstance = null

export function getMsalInstance() {
  if (!clientId) return null
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
  }
  return msalInstance
}
