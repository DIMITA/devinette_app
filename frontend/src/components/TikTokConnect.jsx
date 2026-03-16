import { useState, useEffect } from 'react'

const AUTH_KEY = 'devinette_jwt'

export function getAuthToken() {
  return localStorage.getItem(AUTH_KEY)
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_KEY)
}

export async function authFetch(url, options = {}) {
  const token = getAuthToken()
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  })
}

export default function TikTokConnect({ onUserChange }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  // Handle /auth/success?token=... redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token && window.location.pathname === '/auth/success') {
      setAuthToken(token)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) {
          setUser(data)
          onUserChange?.(data)
        } else {
          clearAuthToken()
        }
      })
      .catch(() => clearAuthToken())
      .finally(() => setLoading(false))
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    setError(null)
    try {
      const r = await fetch('/api/auth/tiktok/url')
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setError(d.detail || 'TikTok OAuth non disponible')
        return
      }
      const { url } = await r.json()
      window.location.href = url
    } catch (err) {
      setError('Backend inaccessible — démarrez le serveur Python (port 8009)')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    clearAuthToken()
    setUser(null)
    onUserChange?.(null)
  }

  if (loading) return null

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.tiktok_avatar_url && (
          <img
            src={user.tiktok_avatar_url}
            alt={user.tiktok_username}
            className="w-8 h-8 rounded-full border border-white/20"
          />
        )}
        <div>
          <p className="text-sm font-bold text-white">@{user.tiktok_username}</p>
          <p className="text-xs text-white/40">Connecté TikTok</p>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-white/40 hover:text-red-400 transition-colors ml-1"
          title="Déconnecter"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all"
        style={{
          background: 'linear-gradient(135deg, #010101 0%, #69C9D0 50%, #EE1D52 100%)',
          color: 'white',
          border: 'none',
          cursor: connecting ? 'wait' : 'pointer',
          opacity: connecting ? 0.7 : 1,
        }}
      >
        {connecting ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
          </svg>
        )}
        {connecting ? 'Connexion...' : 'Connecter TikTok'}
      </button>
      {error && (
        <p className="text-xs text-red-400 max-w-xs text-right">⚠️ {error}</p>
      )}
    </div>
  )
}
