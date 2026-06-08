export type Role = 'user' | 'admin'

export type AlertType =
  | 'medecin'
  | 'pompier'
  | 'police'
  | 'sos_manuel'
  | 'chute'
  | 'malaise'
  | 'agression'
  | 'batterie_faible'
  | 'bracelet_deconnecte'
  | 'sortie_zone'

export type AlertStatus =
  | 'nouvelle'
  | 'prise_en_charge'
  | 'en_cours'
  | 'resolue'
  | 'archivee'
  | 'annulee'

export type UrgencyLevel = 'faible' | 'moyen' | 'eleve' | 'critique'

export type ConnectionStatus = 'connecte' | 'deconnecte'

export interface AppUser {
  id: string
  nom: string
  prenom: string
  email: string
  role: Role
  telephone?: string | null
  date_creation: string
}

export interface Bracelet {
  id: string
  numero_serie: string
  batterie: number
  statut_connexion: ConnectionStatus
  derniere_position?: { lat: number; lng: number } | null
  utilisateur_id?: string | null
  derniere_sync: string
  users?: AppUser
}

export interface Alert {
  id: string
  type_alerte: AlertType
  description?: string | null
  latitude?: number | null
  longitude?: number | null
  niveau_urgence: UrgencyLevel
  statut: AlertStatus
  date_creation: string
  utilisateur_id?: string | null
  bracelet_id?: string | null
  users?: AppUser
  bracelets?: Bracelet
}

export interface AlertHistory {
  id: string
  alerte_id: string
  ancien_statut?: AlertStatus | null
  nouveau_statut: AlertStatus
  date_modification: string
  utilisateur_action?: string | null
  users?: AppUser
}

export interface DashboardStats {
  alertes_nouvelles: number
  alertes_en_cours: number
  alertes_aujourd_hui: number
  bracelets_connectes: number
  total_bracelets: number
  total_utilisateurs: number
}
