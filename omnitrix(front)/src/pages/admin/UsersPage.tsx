import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import PageHeader from '../../components/ui/PageHeader'
import Modal from '../../components/ui/Modal'
import type { AppUser, Role } from '../../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const EMPTY_FORM = { nom: '', prenom: '', email: '', telephone: '', role: 'user' as Role }

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

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<AppUser | null>(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const { data } = await supabase.from('users').select('*').order('date_creation', { ascending: false })
    setUsers((data as AppUser[]) ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  function openEdit(user: AppUser) {
    setEditing(user)
    setForm({ nom: user.nom, prenom: user.prenom, email: user.email, telephone: user.telephone ?? '', role: user.role })
    setError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.nom || !form.prenom || !form.email) {
      setError('Nom, prénom et email sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')

    if (editing) {
      const { error } = await supabase
        .from('users')
        .update({ nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone || null, role: form.role })
        .eq('id', editing.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('users').insert({
        nom: form.nom, prenom: form.prenom, email: form.email,
        telephone: form.telephone || null, role: form.role,
      })
      if (error) { setError(error.message); setSaving(false); return }
    }

    setSaving(false)
    setModalOpen(false)
    loadUsers()
  }

  async function handleDelete(user: AppUser) {
    await supabase.from('users').delete().eq('id', user.id)
    setConfirmDelete(null)
    loadUsers()
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  return (
    <div style={{ padding: 40 }}>
      <PageHeader
        title="Utilisateurs"
        subtitle={`${filtered.length} utilisateur${filtered.length !== 1 ? 's' : ''}`}
        sectionNum="03 — Utilisateurs"
        action={
          <button
            onClick={openCreate}
            style={{
              background: '#00b4c6', border: 'none', padding: '10px 20px',
              color: '#03111e', fontFamily: '"Space Mono", monospace',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#007a88')}
            onMouseLeave={e => (e.currentTarget.style.background = '#00b4c6')}
          >
            + Nouvel utilisateur
          </button>
        }
      />

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputSt, maxWidth: 360 }}
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
            Aucun utilisateur trouvé
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,180,198,0.12)', background: 'rgba(0,180,198,0.03)' }}>
                <th style={thSt}>Nom</th>
                <th style={thSt}>Email</th>
                <th style={thSt}>Téléphone</th>
                <th style={thSt}>Rôle</th>
                <th style={thSt}>Créé le</th>
                <th style={{ ...thSt, textAlign: 'right' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,180,198,0.07)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,198,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, border: '1px solid rgba(0,180,198,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: '"Archivo Black", sans-serif', fontSize: 10,
                        color: '#00b4c6', flexShrink: 0,
                      }}>
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                      <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(240,244,247,0.85)' }}>
                        {user.prenom} {user.nom}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 10, color: 'rgba(240,244,247,0.5)' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 10, color: 'rgba(240,244,247,0.4)' }}>
                    {user.telephone ?? '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontFamily: '"Space Mono", monospace', fontSize: 9,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: user.role === 'admin' ? '#e8d5a3' : 'rgba(240,244,247,0.4)',
                      background: user.role === 'admin' ? 'rgba(232,213,163,0.1)' : 'rgba(240,244,247,0.04)',
                      border: `1px solid ${user.role === 'admin' ? 'rgba(232,213,163,0.3)' : 'rgba(240,244,247,0.08)'}`,
                      padding: '3px 8px',
                    }}>
                      {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: '"Space Mono", monospace', fontSize: 10, color: 'rgba(240,244,247,0.35)' }}>
                    {formatDate(user.date_creation)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEdit(user)}
                        style={{ background: 'transparent', border: '1px solid rgba(0,180,198,0.2)', padding: '5px 12px', color: '#00b4c6', fontFamily: '"Space Mono", monospace', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,180,198,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user)}
                        style={{ background: 'transparent', border: '1px solid rgba(255,107,71,0.3)', padding: '5px 12px', color: '#ff6b47', fontFamily: '"Space Mono", monospace', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,71,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
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

      {/* Modal création / édition */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: 'rgba(255,107,71,0.1)', border: '1px solid rgba(255,107,71,0.3)', color: '#ff6b47', fontFamily: '"Space Mono", monospace', fontSize: 11, padding: '10px 14px' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelSt}>Prénom *</label>
              <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} style={inputSt} placeholder="Jean" onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)')} />
            </div>
            <div>
              <label style={labelSt}>Nom *</label>
              <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inputSt} placeholder="Dupont" onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)')} />
            </div>
          </div>
          <div>
            <label style={labelSt}>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputSt} placeholder="jean.dupont@example.com" onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)')} />
          </div>
          <div>
            <label style={labelSt}>Téléphone</label>
            <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} style={inputSt} placeholder="+33 6 12 34 56 78" onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.5)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,180,198,0.2)')} />
          </div>
          <div>
            <label style={labelSt}>Rôle</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))} style={{ ...inputSt, cursor: 'pointer' }}>
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(240,244,247,0.1)', padding: '10px 20px', color: 'rgba(240,244,247,0.5)', fontFamily: '"Space Mono", monospace', fontSize: 10, cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} style={{ background: saving ? 'rgba(0,180,198,0.4)' : '#00b4c6', border: 'none', padding: '10px 20px', color: '#03111e', fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation suppression */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmer la suppression" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(240,244,247,0.6)', lineHeight: 1.6, margin: 0 }}>
            Voulez-vous vraiment supprimer{' '}
            <span style={{ color: '#f0f4f7' }}>{confirmDelete?.prenom} {confirmDelete?.nom}</span> ?
            Cette action est irréversible.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ background: 'transparent', border: '1px solid rgba(240,244,247,0.1)', padding: '10px 20px', color: 'rgba(240,244,247,0.5)', fontFamily: '"Space Mono", monospace', fontSize: 10, cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={() => confirmDelete && handleDelete(confirmDelete)} style={{ background: '#ff6b47', border: 'none', padding: '10px 20px', color: '#fff', fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
