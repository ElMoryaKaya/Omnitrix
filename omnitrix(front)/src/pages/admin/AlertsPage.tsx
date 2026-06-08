import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import PageHeader from '../../components/ui/PageHeader'
import { StatusBadge, UrgencyBadge, AlertTypeBadge } from '../../components/ui/Badge'
import type { Alert, AlertStatus, AlertType, UrgencyLevel } from '../../types'

const ALERT_TYPES: { value: AlertType | ''; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'medecin', label: 'Médecin' },
  { value: 'pompier', label: 'Pompier' },
  { value: 'police', label: 'Police' },
  { value: 'sos_manuel', label: 'SOS Manuel' },
  { value: 'chute', label: 'Chute détectée' },
  { value: 'malaise', label: 'Malaise' },
  { value: 'agression', label: 'Agression' },
  { value: 'batterie_faible', label: 'Batterie faible' },
  { value: 'bracelet_deconnecte', label: 'Bracelet déconnecté' },
  { value: 'sortie_zone', label: 'Sortie de zone' },
]

const STATUSES: { value: AlertStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'nouvelle', label: 'Nouvelle' },
  { value: 'prise_en_charge', label: 'Prise en charge' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'resolue', label: 'Résolue' },
  { value: 'archivee', label: 'Archivée' },
  { value: 'annulee', label: 'Annulée' },
]

const URGENCIES: { value: UrgencyLevel | ''; label: string }[] = [
  { value: '', label: 'Toutes urgences' },
  { value: 'critique', label: 'Critique' },
  { value: 'eleve', label: 'Élevé' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'faible', label: 'Faible' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const selectStyle: React.CSSProperties = {
  background: '#03111e',
  border: '1px solid rgba(0,180,198,0.2)',
  padding: '8px 12px',
  color: 'rgba(240,244,247,0.7)',
  fontFamily: '"Space Mono", monospace',
  fontSize: 10,
  outline: 'none',
  cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
  ...selectStyle,
  flex: 1,
  minWidth: 200,
}

export default function AlertsPage() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<AlertType | ''>('')
  const [filterStatus, setFilterStatus] = useState<AlertStatus | ''>('')
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | ''>('')
  const [search, setSearch] = useState('')

  const loadAlerts = useCallback(async () => {
    let query = supabase
      .from('alertes')
      .select('*, users(nom, prenom, email)')
      .order('date_creation', { ascending: false })

    if (filterType) query = query.eq('type_alerte', filterType)
    if (filterStatus) query = query.eq('statut', filterStatus)
    if (filterUrgency) query = query.eq('niveau_urgence', filterUrgency)

    const { data } = await query
    setAlerts((data as Alert[]) ?? [])
    setLoading(false)
  }, [filterType, filterStatus, filterUrgency])

  useEffect(() => {
    loadAlerts()

    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertes' }, () => {
        loadAlerts()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadAlerts])

  const filtered = alerts.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.users?.nom?.toLowerCase().includes(q) ||
      a.users?.prenom?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    )
  })

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '12px 20px',
    fontFamily: '"Space Mono", monospace',
    fontSize: 9,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(240,244,247,0.3)',
    fontWeight: 400,
  }

  return (
    <div style={{ padding: 40 }}>
      <PageHeader
        title="Alertes"
        subtitle={`${filtered.length} alerte${filtered.length !== 1 ? 's' : ''}`}
        sectionNum="02 — Alertes"
      />

      {/* Filtres */}
      <div style={{
        background: 'rgba(3,17,30,0.5)',
        border: '1px solid rgba(0,180,198,0.12)',
        padding: 16,
        marginBottom: 24,
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: 10,
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Rechercher par nom, description…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 200px' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)')}
        />
        <select value={filterType} onChange={e => setFilterType(e.target.value as AlertType | '')} style={selectStyle}>
          {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AlertStatus | '')} style={selectStyle}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value as UrgencyLevel | '')} style={selectStyle}>
          {URGENCIES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        {(filterType || filterStatus || filterUrgency || search) && (
          <button
            onClick={() => { setFilterType(''); setFilterStatus(''); setFilterUrgency(''); setSearch('') }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(240,244,247,0.1)',
              padding: '8px 12px',
              color: 'rgba(240,244,247,0.4)',
              fontFamily: '"Space Mono", monospace',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(3,17,30,0.5)',
        border: '1px solid rgba(0,180,198,0.12)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid rgba(0,180,198,0.15)', borderTopColor: '#00b4c6',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: 48, textAlign: 'center',
            fontFamily: '"Space Mono", monospace', fontSize: 11,
            color: 'rgba(240,244,247,0.2)', letterSpacing: '0.1em',
          }}>
            Aucune alerte trouvée
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,180,198,0.12)', background: 'rgba(0,180,198,0.03)' }}>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Urgence</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Utilisateur</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert, i) => (
                <tr
                  key={alert.id}
                  onClick={() => navigate(`/admin/alerts/${alert.id}`)}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,180,198,0.07)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,198,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}><AlertTypeBadge type={alert.type_alerte} /></td>
                  <td style={{ padding: '14px 20px' }}><UrgencyBadge level={alert.niveau_urgence} /></td>
                  <td style={{ padding: '14px 20px' }}><StatusBadge status={alert.statut} /></td>
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(240,244,247,0.7)' }}>
                    {alert.users
                      ? `${alert.users.prenom} ${alert.users.nom}`
                      : <span style={{ color: 'rgba(240,244,247,0.25)', fontStyle: 'italic' }}>Inconnu</span>
                    }
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 10, color: 'rgba(240,244,247,0.35)', whiteSpace: 'nowrap' }}>
                    {formatDate(alert.date_creation)}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontFamily: '"Space Mono", monospace', fontSize: 10, color: '#00b4c6' }}>
                    Détails →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
