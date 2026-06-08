import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import PageHeader from '../../components/ui/PageHeader'
import { StatusBadge, UrgencyBadge, AlertTypeBadge } from '../../components/ui/Badge'
import type { Alert, DashboardStats } from '../../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    alertes_nouvelles: 0,
    alertes_en_cours: 0,
    alertes_aujourd_hui: 0,
    bracelets_connectes: 0,
    total_bracelets: 0,
    total_utilisateurs: 0,
  })
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertes' }, () => {
        loadDashboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadDashboard() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [alertesRes, braceletsRes, usersRes, recentRes] = await Promise.all([
      supabase.from('alertes').select('statut, date_creation'),
      supabase.from('bracelets').select('statut_connexion'),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase
        .from('alertes')
        .select('*, users(nom, prenom)')
        .order('date_creation', { ascending: false })
        .limit(8),
    ])

    if (alertesRes.data) {
      const alertes = alertesRes.data
      setStats(prev => ({
        ...prev,
        alertes_nouvelles: alertes.filter(a => a.statut === 'nouvelle').length,
        alertes_en_cours: alertes.filter(a => a.statut === 'en_cours' || a.statut === 'prise_en_charge').length,
        alertes_aujourd_hui: alertes.filter(a => new Date(a.date_creation) >= today).length,
      }))
    }

    if (braceletsRes.data) {
      const bracelets = braceletsRes.data
      setStats(prev => ({
        ...prev,
        bracelets_connectes: bracelets.filter(b => b.statut_connexion === 'connecte').length,
        total_bracelets: bracelets.length,
      }))
    }

    if (usersRes.count !== null) {
      setStats(prev => ({ ...prev, total_utilisateurs: usersRes.count! }))
    }

    if (recentRes.data) {
      setRecentAlerts(recentRes.data as Alert[])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(0,180,198,0.15)',
          borderTopColor: '#00b4c6',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble en temps réel"
        sectionNum="01 — Dashboard"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Alertes nouvelles"   value={stats.alertes_nouvelles}   icon="🔴" color="red"    subtitle="En attente" />
        <StatCard label="En cours"            value={stats.alertes_en_cours}    icon="🔵" color="teal"   subtitle="Prise en charge / en cours" />
        <StatCard label="Aujourd'hui"         value={stats.alertes_aujourd_hui} icon="📅" color="coral"  subtitle="Alertes ce jour" />
        <StatCard label="Bracelets connectés" value={`${stats.bracelets_connectes}/${stats.total_bracelets}`} icon="⌚" color="sand" subtitle="Actifs maintenant" />
        <StatCard label="Utilisateurs"        value={stats.total_utilisateurs}  icon="👥" color="muted"  subtitle="Comptes enregistrés" />
      </div>

      {/* Recent alerts panel */}
      <div style={{
        background: 'rgba(3,17,30,0.5)',
        border: '1px solid rgba(0,180,198,0.12)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(0,180,198,0.1)',
        }}>
          <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 13, color: '#f0f4f7', letterSpacing: '-0.01em' }}>
            Alertes récentes
          </span>
          <button
            onClick={() => navigate('/admin/alerts')}
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 9,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#00b4c6',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Voir tout →
          </button>
        </div>

        {recentAlerts.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            fontFamily: '"Space Mono", monospace',
            fontSize: 11,
            color: 'rgba(240,244,247,0.25)',
            letterSpacing: '0.1em',
          }}>
            Aucune alerte enregistrée
          </div>
        ) : (
          <div>
            {recentAlerts.map((alert, i) => (
              <div
                key={alert.id}
                onClick={() => navigate(`/admin/alerts/${alert.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 24px',
                  borderBottom: i < recentAlerts.length - 1 ? '1px solid rgba(0,180,198,0.07)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,198,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <AlertTypeBadge type={alert.type_alerte} />
                  </div>
                  <p style={{
                    fontFamily: '"Space Mono", monospace',
                    fontSize: 10,
                    color: 'rgba(240,244,247,0.35)',
                    margin: 0,
                  }}>
                    {alert.users
                      ? `${alert.users.prenom} ${alert.users.nom}`
                      : 'Utilisateur inconnu'
                    } · {formatDate(alert.date_creation)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <UrgencyBadge level={alert.niveau_urgence} />
                  <StatusBadge status={alert.statut} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
