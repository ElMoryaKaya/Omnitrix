import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Tableau de bord', num: '01' },
  { to: '/admin/alerts',    label: 'Alertes',          num: '02' },
  { to: '/admin/users',     label: 'Utilisateurs',     num: '03' },
  { to: '/admin/bracelets', label: 'Bracelets',        num: '04' },
  { to: '/admin/history',   label: 'Historique',       num: '05' },
]

export default function Sidebar() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = `${currentUser?.prenom?.[0] ?? ''}${currentUser?.nom?.[0] ?? ''}`

  return (
    <aside style={{ background: '#03111e', borderRight: '1px solid rgba(0,180,198,0.12)' }}
      className="w-64 min-h-screen flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(0,180,198,0.12)' }}>
        <div className="flex items-center gap-3">
          <svg width="28" height="18" viewBox="0 0 32 20" fill="none">
            <path d="M1 10 C5 4, 9 2, 13 6 C17 10, 21 12, 25 6 C27 3, 29 2, 31 4"
              stroke="#00b4c6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M1 16 C5 12, 9 10, 13 13 C17 16, 21 16, 25 12 C27 10, 29 9, 31 11"
              stroke="rgba(0,180,198,.35)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <div>
            <p style={{ fontFamily: '"Archivo Black", sans-serif', color: '#f0f4f7', fontSize: 18, lineHeight: 1 }}>
              Omnitrix<span style={{ color: '#00b4c6' }}>.</span>
            </p>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(240,244,247,0.4)', textTransform: 'uppercase', marginTop: 3 }}>
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              fontFamily: '"Space Mono", monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderLeft: isActive ? '2px solid #00b4c6' : '2px solid transparent',
              background: isActive ? 'rgba(0,180,198,0.08)' : 'transparent',
              color: isActive ? '#00b4c6' : 'rgba(240,244,247,0.45)',
              transition: 'all 0.2s',
            })}
            onMouseEnter={e => {
              if (!(e.currentTarget as HTMLElement).style.borderLeftColor.includes('6')) {
                (e.currentTarget as HTMLElement).style.color = '#f0f4f7'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(10,53,80,0.5)'
              }
            }}
            onMouseLeave={e => {
              if (!(e.currentTarget as HTMLElement).style.borderLeftColor.includes('6')) {
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(240,244,247,0.45)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }
            }}
          >
            <span style={{ color: 'rgba(0,180,198,0.5)', fontSize: 9, letterSpacing: '0.15em', flexShrink: 0 }}>
              {item.num}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Profil + déconnexion */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid rgba(0,180,198,0.12)' }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div style={{
            width: 30, height: 30,
            background: 'rgba(0,180,198,0.15)',
            border: '1px solid rgba(0,180,198,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: '#00b4c6',
            flexShrink: 0,
          }}>
            {initials || '??'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: '#f0f4f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Admin'}
            </p>
            <p style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: 'rgba(240,244,247,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px',
            fontFamily: '"Space Mono", monospace', fontSize: 10,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(240,244,247,0.35)', background: 'transparent', border: 'none',
            cursor: 'pointer', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ff6b47')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,247,0.35)')}
        >
          <span style={{ fontSize: 12 }}>↩</span> Déconnexion
        </button>
      </div>
    </aside>
  )
}
