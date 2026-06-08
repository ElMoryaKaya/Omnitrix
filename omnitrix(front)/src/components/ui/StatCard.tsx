import React from 'react'

interface StatCardProps {
  label: string
  value: number | string
  icon?: string
  color?: 'teal' | 'red' | 'coral' | 'sand' | 'muted'
  subtitle?: string
}

const colorMap = {
  teal:  { val: '#00b4c6', border: 'rgba(0,180,198,0.3)',  top: '#00b4c6' },
  red:   { val: '#ff6b6b', border: 'rgba(255,107,107,0.3)', top: '#ff6b6b' },
  coral: { val: '#ff6b47', border: 'rgba(255,107,71,0.3)',  top: '#ff6b47' },
  sand:  { val: '#e8d5a3', border: 'rgba(232,213,163,0.3)', top: '#e8d5a3' },
  muted: { val: 'rgba(240,244,247,0.6)', border: 'rgba(240,244,247,0.1)', top: 'rgba(240,244,247,0.3)' },
}

export default function StatCard({ label, value, icon, color = 'teal', subtitle }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div style={{
      background: 'rgba(3,17,30,0.6)',
      border: `1px solid ${c.border}`,
      padding: '28px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.3s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = c.top)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: c.top, opacity: 0.7,
      }} />

      <div style={{
        fontFamily: '"Space Mono", monospace',
        fontSize: 9,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(240,244,247,0.4)',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
        {label}
      </div>

      <div style={{
        fontFamily: '"Archivo Black", sans-serif',
        fontSize: 'clamp(36px, 4vw, 52px)',
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: c.val,
      }}>
        {value}
      </div>

      {subtitle && (
        <div style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: 9,
          letterSpacing: '0.1em',
          color: 'rgba(240,244,247,0.3)',
          marginTop: 8,
          textTransform: 'uppercase',
        }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
