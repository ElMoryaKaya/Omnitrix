import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      navigate('/admin/dashboard')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#03111e',
    border: '1px solid rgba(0,180,198,0.25)',
    padding: '12px 14px',
    color: '#f0f4f7',
    fontFamily: '"Space Mono", monospace',
    fontSize: 12,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#03111e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(0,180,198,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,198,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', width: 56, height: 56,
            border: '1px solid rgba(0,180,198,0.4)',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v6l5 3-1 1.73-6-3.73V7h2z" fill="#00b4c6" />
            </svg>
          </div>

          <div style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: 9,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#00b4c6',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}>
            <span style={{ display: 'inline-block', width: 24, height: 1, background: 'rgba(0,180,198,0.5)' }} />
            Système d'administration
            <span style={{ display: 'inline-block', width: 24, height: 1, background: 'rgba(0,180,198,0.5)' }} />
          </div>

          <h1 style={{
            fontFamily: '"Archivo Black", sans-serif',
            fontSize: 'clamp(28px, 5vw, 38px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#f0f4f7',
          }}>
            OMNITRIX
          </h1>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(6,32,53,0.8)',
          border: '1px solid rgba(0,180,198,0.18)',
          padding: '36px 32px',
          position: 'relative',
        }}>
          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#00b4c6', opacity: 0.6 }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{
                background: 'rgba(255,107,71,0.1)',
                border: '1px solid rgba(255,107,71,0.3)',
                color: '#ff6b47',
                fontFamily: '"Space Mono", monospace',
                fontSize: 11,
                padding: '10px 14px',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontFamily: '"Space Mono", monospace',
                fontSize: 9,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(240,244,247,0.4)',
                marginBottom: 8,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.6)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.25)')}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontFamily: '"Space Mono", monospace',
                fontSize: 9,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(240,244,247,0.4)',
                marginBottom: 8,
              }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.6)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.25)')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(0,180,198,0.4)' : '#00b4c6',
                border: 'none',
                padding: '14px',
                fontFamily: '"Space Mono", monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#03111e',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#007a88' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00b4c6' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          fontFamily: '"Space Mono", monospace',
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(240,244,247,0.2)',
          marginTop: 24,
        }}>
          Bracelet d'alerte connecté
        </p>
      </div>
    </div>
  )
}
