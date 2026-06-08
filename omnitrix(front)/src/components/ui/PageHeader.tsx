import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  sectionNum?: string
}

export default function PageHeader({ title, subtitle, action, sectionNum }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {sectionNum && (
          <div style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#00b4c6',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(0,180,198,0.5)' }} />
            {sectionNum}
          </div>
        )}
        <h1 style={{
          fontFamily: '"Archivo Black", sans-serif',
          fontSize: 'clamp(28px, 3vw, 42px)',
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          color: '#f0f4f7',
          marginBottom: subtitle ? 8 : 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(240,244,247,0.35)',
            marginTop: 6,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
