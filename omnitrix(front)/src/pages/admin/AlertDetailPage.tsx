import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AlertMap from '../../components/alerts/AlertMap'
import { StatusBadge, UrgencyBadge, AlertTypeBadge, statusLabel } from '../../components/ui/Badge'
import type { Alert, AlertHistory, AlertStatus } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

const NEXT_STATUSES: Record<AlertStatus, AlertStatus[]> = {
  nouvelle:        ['prise_en_charge', 'annulee'],
  prise_en_charge: ['en_cours', 'annulee'],
  en_cours:        ['resolue', 'annulee'],
  resolue:         ['archivee'],
  archivee:        [],
  annulee:         [],
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const panel: React.CSSProperties = {
  background: 'rgba(3,17,30,0.5)',
  border: '1px solid rgba(0,180,198,0.12)',
  padding: 24,
}

const label: React.CSSProperties = {
  fontFamily: '"Space Mono", monospace',
  fontSize: 9,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(240,244,247,0.35)',
}

const value: React.CSSProperties = {
  fontFamily: '"Space Mono", monospace',
  fontSize: 11,
  color: 'rgba(240,244,247,0.8)',
}

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [history, setHistory] = useState<AlertHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) loadAlert(id)
  }, [id])

  async function loadAlert(alertId: string) {
    const [alertRes, historyRes] = await Promise.all([
      supabase
        .from('alertes')
        .select('*, users(nom, prenom, email, telephone), bracelets(numero_serie, batterie)')
        .eq('id', alertId)
        .single(),
      supabase
        .from('historique_alertes')
        .select('*, users(nom, prenom)')
        .eq('alerte_id', alertId)
        .order('date_modification', { ascending: false }),
    ])

    if (alertRes.data) setAlert(alertRes.data as Alert)
    if (historyRes.data) setHistory(historyRes.data as AlertHistory[])
    setLoading(false)
  }

  async function changeStatus(newStatus: AlertStatus) {
    if (!alert || !id) return
    setUpdating(true)

    await supabase.from('historique_alertes').insert({
      alerte_id: id,
      ancien_statut: alert.statut,
      nouveau_statut: newStatus,
      utilisateur_action: currentUser?.id,
    })

    await supabase.from('alertes').update({ statut: newStatus }).eq('id', id)

    await loadAlert(id)
    setUpdating(false)
  }

  if (loading) {
    return (
      <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid rgba(0,180,198,0.15)', borderTopColor: '#00b4c6',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!alert) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: 'rgba(240,244,247,0.3)' }}>
          Alerte introuvable.
        </p>
        <button
          onClick={() => navigate('/admin/alerts')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: '"Space Mono", monospace', fontSize: 10, color: '#00b4c6',
            marginTop: 12, letterSpacing: '0.1em',
          }}
        >
          ← Retour aux alertes
        </button>
      </div>
    )
  }

  const nextStatuses = NEXT_STATUSES[alert.statut]

  return (
    <div style={{ padding: 40 }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: '"Space Mono", monospace', fontSize: 10,
        letterSpacing: '0.1em', marginBottom: 32,
      }}>
        <button
          onClick={() => navigate('/admin/alerts')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00b4c6', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit' }}
        >
          Alertes
        </button>
        <span style={{ color: 'rgba(240,244,247,0.2)' }}>/</span>
        <span style={{ color: 'rgba(240,244,247,0.5)' }}>Détail</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Map */}
        <div>
          <AlertMap alert={alert} height="380px" />
          {alert.latitude && alert.longitude && (
            <p style={{
              fontFamily: '"Space Mono", monospace', fontSize: 9,
              color: 'rgba(240,244,247,0.25)', textAlign: 'center', marginTop: 8,
              letterSpacing: '0.1em',
            }}>
              {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
            </p>
          )}
        </div>

        {/* Info panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main info */}
          <div style={panel}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <AlertTypeBadge type={alert.type_alerte} />
              <UrgencyBadge level={alert.niveau_urgence} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { l: 'Statut', v: <StatusBadge status={alert.statut} /> },
                { l: 'Date / heure', v: <span style={value}>{formatDate(alert.date_creation)}</span> },
                ...(alert.users ? [
                  { l: 'Utilisateur', v: <span style={value}>{alert.users.prenom} {alert.users.nom}</span> },
                  ...(alert.users.telephone ? [{ l: 'Téléphone', v: <span style={value}>{alert.users.telephone}</span> }] : []),
                ] : []),
                ...(alert.bracelets ? [{ l: 'Bracelet', v: <span style={{ ...value, fontFamily: '"Space Mono", monospace', fontSize: 10 }}>{alert.bracelets.numero_serie}</span> }] : []),
              ].map(({ l, v }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={label}>{l}</span>
                  {v}
                </div>
              ))}
              {alert.description && (
                <div style={{ paddingTop: 12, borderTop: '1px solid rgba(0,180,198,0.1)' }}>
                  <div style={{ ...label, marginBottom: 6 }}>Description</div>
                  <p style={{ ...value, margin: 0 }}>{alert.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status actions */}
          {nextStatuses.length > 0 && (
            <div style={panel}>
              <div style={{ ...label, marginBottom: 14 }}>Changer le statut</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {nextStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => changeStatus(status)}
                    disabled={updating}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(0,180,198,0.3)',
                      padding: '8px 16px',
                      color: '#00b4c6',
                      fontFamily: '"Space Mono", monospace',
                      fontSize: 10,
                      letterSpacing: '0.1em',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      opacity: updating ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!updating) { e.currentTarget.style.background = 'rgba(0,180,198,0.1)' } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {updating ? '…' : `→ ${statusLabel(status)}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div style={{ ...panel, marginTop: 24 }}>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 13, color: '#f0f4f7', marginBottom: 20 }}>
            Historique des statuts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {history.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? '#00b4c6' : 'rgba(240,244,247,0.2)',
                }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
                  {h.ancien_statut && (
                    <>
                      <StatusBadge status={h.ancien_statut} />
                      <span style={{ color: 'rgba(240,244,247,0.25)', fontSize: 12 }}>→</span>
                    </>
                  )}
                  <StatusBadge status={h.nouveau_statut} />
                  {h.users && (
                    <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: 'rgba(240,244,247,0.35)' }}>
                      par {h.users.prenom} {h.users.nom}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 9, color: 'rgba(240,244,247,0.25)', whiteSpace: 'nowrap' }}>
                  {formatDate(h.date_modification)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
