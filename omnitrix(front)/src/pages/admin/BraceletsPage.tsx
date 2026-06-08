import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import { ConnectionBadge } from '../../components/ui/Badge'
import type { Bracelet, AppUser, ConnectionStatus } from '../../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function BatteryBar({ value }: { value: number }) {
  const color = value > 60 ? '#4ce0a0' : value > 20 ? '#ffb347' : '#ff6b47'
  const bg = value > 60 ? 'rgba(76,224,160,0.15)' : value > 20 ? 'rgba(255,179,71,0.15)' : 'rgba(255,107,71,0.15)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(240,244,247,0.08)', maxWidth: 64, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{
        fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 700,
        color, background: bg, padding: '2px 6px',
        border: `1px solid ${color}40`,
      }}>
        {value}%
      </span>
    </div>
  )
}

const EMPTY_FORM = { numero_serie: '', batterie: 100, statut_connexion: 'deconnecte' as ConnectionStatus, utilisateur_id: '' }

const inputSt: React.CSSProperties = {
  width: '100%',
  background: '#03111e',
  border: '1px solid rgba(0,180,198,0.2)',
  padding: '10px 12px',
  color: '#f0f4f7',
  fontFamily: '"Space Mono", monospace',
  fontSize: 11,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelSt: React.CSSProperties = {
  display: 'block',
  fontFamily: '"Space Mono", monospace',
  fontSize: 9,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(240,244,247,0.35)',
  marginBottom: 6,
}

const thSt: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 20px',
  fontFamily: '"Space Mono", monospace',
  fontSize: 9,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(240,244,247,0.3)',
  fontWeight: 400,
}

export default function BraceletsPage() {
  const [bracelets, setBracelets] = useState<Bracelet[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Bracelet | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Bracelet | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [braceletsRes, usersRes] = await Promise.all([
      supabase.from('bracelets').select('*, users(nom, prenom, email)').order('derniere_sync', { ascending: false }),
      supabase.from('users').select('id, nom, prenom, email').eq('role', 'user').order('nom'),
    ])
    setBracelets((braceletsRes.data as Bracelet[]) ?? [])
    setUsers((usersRes.data as AppUser[]) ?? [])
    setLoading(false)
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true) }

  function openEdit(b: Bracelet) {
    setEditing(b)
    setForm({ numero_serie: b.numero_serie, batterie: b.batterie, statut_connexion: b.statut_connexion, utilisateur_id: b.utilisateur_id ?? '' })
    setError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.numero_serie) { setError('Le numéro de série est obligatoire.'); return }
    setSaving(true)
    setError('')
    const payload = { numero_serie: form.numero_serie, batterie: form.batterie, statut_connexion: form.statut_connexion, utilisateur_id: form.utilisateur_id || null }
    const { error } = editing
      ? await supabase.from('bracelets').update(payload).eq('id', editing.id)
      : await supabase.from('bracelets').insert(payload)
    if (error) { setError(error.message); setSaving(false); return }
    setSaving(false)
    setModalOpen(false)
    loadData()
  }

  async function handleDelete(b: Bracelet) {
    await supabase.from('bracelets').delete().eq('id', b.id)
    setConfirmDelete(null)
    loadData()
  }

  const filtered = bracelets.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return b.numero_serie.toLowerCase().includes(q) || b.users?.nom?.toLowerCase().includes(q) || b.users?.prenom?.toLowerCase().includes(q)
  })

  return (
    <div style={{ padding: 40 }}>
      <PageHeader
        title="Bracelets"
        subtitle={`${filtered.length} bracelet${filtered.length !== 1 ? 's' : ''}`}
        sectionNum="04 — Bracelets"
        action={
          <button
            onClick={openCreate}
            style={{ background: '#00b4c6', border: 'none', padding: '10px 20px', color: '#03111e', fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#007a88')}
            onMouseLeave={e => (e.currentTarget.style.background = '#00b4c6')}
          >
            + Nouveau bracelet
          </button>
        }
      />

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Rechercher par numéro de série ou utilisateur…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputSt, maxWidth: 380 }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)')}
        />
      </div>

      <div style={{ background: 'rgba(3,17,30,0.5)', border: '1px solid rgba(0,180,198,0.12)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(0,180,198,0.15)', borderTopColor: '#00b4c6', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(240,244,247,0.2)' }}>
            Aucun bracelet trouvé
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,180,198,0.12)', background: 'rgba(0,180,198,0.03)' }}>
                <th style={thSt}>Numéro de série</th>
                <th style={thSt}>Statut</th>
                <th style={thSt}>Batterie</th>
                <th style={thSt}>Utilisateur</th>
                <th style={thSt}>Dernière sync</th>
                <th style={{ ...thSt, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,180,198,0.07)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,198,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 11, color: '#00b4c6' }}>
                    {b.numero_serie}
                  </td>
                  <td style={{ padding: '14px 20px' }}><ConnectionBadge status={b.statut_connexion} /></td>
                  <td style={{ padding: '14px 20px', minWidth: 140 }}><BatteryBar value={b.batterie} /></td>
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(240,244,247,0.7)' }}>
                    {b.users ? `${b.users.prenom} ${b.users.nom}` : <span style={{ color: 'rgba(240,244,247,0.25)', fontStyle: 'italic' }}>Non assigné</span>}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 10, color: 'rgba(240,244,247,0.35)', whiteSpace: 'nowrap' }}>
                    {formatDate(b.derniere_sync)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(b)} style={{ background: 'transparent', border: '1px solid rgba(0,180,198,0.2)', padding: '5px 12px', color: '#00b4c6', fontFamily: '"Space Mono", monospace', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,198,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        Modifier
                      </button>
                      <button onClick={() => setConfirmDelete(b)} style={{ background: 'transparent', border: '1px solid rgba(255,107,71,0.3)', padding: '5px 12px', color: '#ff6b47', fontFamily: '"Space Mono", monospace', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,71,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le bracelet' : 'Nouveau bracelet'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: 'rgba(255,107,71,0.1)', border: '1px solid rgba(255,107,71,0.3)', color: '#ff6b47', fontFamily: '"Space Mono", monospace', fontSize: 11, padding: '10px 14px' }}>{error}</div>}
          <div>
            <label style={labelSt}>Numéro de série *</label>
            <input value={form.numero_serie} onChange={e => setForm(f => ({ ...f, numero_serie: e.target.value }))} style={{ ...inputSt, fontFamily: '"Space Mono", monospace' }} placeholder="BR-001" onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)')} />
          </div>
          <div>
            <label style={labelSt}>Batterie ({form.batterie}%)</label>
            <input type="range" min={0} max={100} value={form.batterie} onChange={e => setForm(f => ({ ...f, batterie: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#00b4c6' }} />
          </div>
          <div>
            <label style={labelSt}>Statut</label>
            <select value={form.statut_connexion} onChange={e => setForm(f => ({ ...f, statut_connexion: e.target.value as ConnectionStatus }))} style={{ ...inputSt, cursor: 'pointer' }}>
              <option value="connecte">Connecté</option>
              <option value="deconnecte">Déconnecté</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Utilisateur associé</label>
            <select value={form.utilisateur_id} onChange={e => setForm(f => ({ ...f, utilisateur_id: e.target.value }))} style={{ ...inputSt, cursor: 'pointer' }}>
              <option value="">Aucun</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(240,244,247,0.1)', padding: '10px 20px', color: 'rgba(240,244,247,0.5)', fontFamily: '"Space Mono", monospace', fontSize: 10, cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? 'rgba(0,180,198,0.4)' : '#00b4c6', border: 'none', padding: '10px 20px', color: '#03111e', fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmer la suppression" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(240,244,247,0.6)', lineHeight: 1.6, margin: 0 }}>
            Supprimer le bracelet{' '}
            <span style={{ color: '#00b4c6' }}>{confirmDelete?.numero_serie}</span> ?
            Cette action est irréversible.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ background: 'transparent', border: '1px solid rgba(240,244,247,0.1)', padding: '10px 20px', color: 'rgba(240,244,247,0.5)', fontFamily: '"Space Mono", monospace', fontSize: 10, cursor: 'pointer' }}>Annuler</button>
            <button onClick={() => confirmDelete && handleDelete(confirmDelete)} style={{ background: '#ff6b47', border: 'none', padding: '10px 20px', color: '#fff', fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Supprimer</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
