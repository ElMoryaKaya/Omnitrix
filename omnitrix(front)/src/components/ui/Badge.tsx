import React from 'react'
import type { AlertStatus, AlertType, UrgencyLevel, ConnectionStatus } from '../../types'

// ── Statuts ──────────────────────────────────────────────────
const statusConfig: Record<AlertStatus, { label: string; color: string; bg: string }> = {
  nouvelle:        { label: 'Nouvelle',        color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
  prise_en_charge: { label: 'Prise en charge', color: '#ff9f47', bg: 'rgba(255,159,71,0.1)' },
  en_cours:        { label: 'En cours',        color: '#00b4c6', bg: 'rgba(0,180,198,0.1)' },
  resolue:         { label: 'Résolue',         color: '#4ce0a0', bg: 'rgba(76,224,160,0.1)' },
  archivee:        { label: 'Archivée',        color: 'rgba(240,244,247,0.35)', bg: 'rgba(240,244,247,0.05)' },
  annulee:         { label: 'Annulée',         color: 'rgba(240,244,247,0.25)', bg: 'rgba(240,244,247,0.04)' },
}

// ── Urgences ─────────────────────────────────────────────────
const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bg: string }> = {
  critique: { label: 'Critique', color: '#ff6b47', bg: 'rgba(255,107,71,0.15)' },
  eleve:    { label: 'Élevé',    color: '#ffb347', bg: 'rgba(255,179,71,0.12)' },
  moyen:    { label: 'Moyen',    color: '#e8d5a3', bg: 'rgba(232,213,163,0.1)' },
  faible:   { label: 'Faible',   color: '#4ce0a0', bg: 'rgba(76,224,160,0.1)' },
}

// ── Types d'alerte ────────────────────────────────────────────
const alertTypeConfig: Record<AlertType, { label: string; emoji: string; color?: string; bg?: string }> = {
  medecin:              { label: 'Médecin',          emoji: '🟡', color: '#e8d5a3', bg: 'rgba(232,213,163,0.12)' },
  pompier:              { label: 'Pompier',           emoji: '🔴', color: '#ff6b47', bg: 'rgba(255,107,71,0.12)' },
  police:               { label: 'Police',            emoji: '🔵', color: '#00b4c6', bg: 'rgba(0,180,198,0.12)' },
  sos_manuel:           { label: 'SOS Manuel',        emoji: '🆘' },
  chute:                { label: 'Chute détectée',    emoji: '⚡' },
  malaise:              { label: 'Malaise',           emoji: '💊' },
  agression:            { label: 'Agression',         emoji: '⚠️' },
  batterie_faible:      { label: 'Batterie faible',   emoji: '🔋' },
  bracelet_deconnecte:  { label: 'Déconnecté',        emoji: '📡' },
  sortie_zone:          { label: 'Sortie de zone',    emoji: '📍' },
}

const monoLabel: React.CSSProperties = {
  fontFamily: '"Space Mono", monospace',
  fontSize: 9,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
}

export function StatusBadge({ status }: { status: AlertStatus }) {
  const cfg = statusConfig[status]
  return (
    <span style={{
      ...monoLabel,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}30`,
      padding: '3px 8px',
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {cfg.label}
    </span>
  )
}

export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const cfg = urgencyConfig[level]
  return (
    <span style={{
      ...monoLabel,
      fontWeight: 700,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      padding: '3px 8px',
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {cfg.label}
    </span>
  )
}

export function AlertTypeBadge({ type }: { type: AlertType }) {
  const cfg = alertTypeConfig[type]
  if (cfg.color) {
    return (
      <span style={{
        ...monoLabel,
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}35`,
        padding: '4px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ fontSize: 11 }}>{cfg.emoji}</span>
        {cfg.label}
      </span>
    )
  }
  return (
    <span style={{
      ...monoLabel,
      color: 'rgba(240,244,247,0.7)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 10,
    }}>
      <span style={{ fontSize: 13 }}>{cfg.emoji}</span>
      {cfg.label}
    </span>
  )
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return status === 'connecte' ? (
    <span style={{ ...monoLabel, color: '#4ce0a0', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ce0a0', display: 'inline-block', animation: 'pulse 2s infinite' }} />
      Connecté
    </span>
  ) : (
    <span style={{ ...monoLabel, color: 'rgba(240,244,247,0.3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(240,244,247,0.3)', display: 'inline-block' }} />
      Déconnecté
    </span>
  )
}

export function alertTypeLabel(type: AlertType): string {
  return alertTypeConfig[type]?.label ?? type
}
export function urgencyLabel(level: UrgencyLevel): string {
  return urgencyConfig[level]?.label ?? level
}
export function statusLabel(status: AlertStatus): string {
  return statusConfig[status]?.label ?? status
}
