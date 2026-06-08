import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = { sm: 420, md: 520, lg: 640, xl: 800 }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (isOpen) { document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,17,30,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />

      <div style={{
        position: 'relative',
        background: '#062035',
        border: '1px solid rgba(0,180,198,0.2)',
        width: '100%',
        maxWidth: sizeMap[size],
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#00b4c6', opacity: 0.6 }} />

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0,180,198,0.12)',
        }}>
          <h2 style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 16, color: '#f0f4f7', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid rgba(0,180,198,0.2)',
            color: 'rgba(240,244,247,0.5)', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f0f4f7'; e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,244,247,0.5)'; e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}
