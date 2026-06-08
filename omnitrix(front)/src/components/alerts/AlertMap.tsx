import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import type { Alert } from '../../types'
import { alertTypeLabel, urgencyLabel } from '../ui/Badge'

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const urgencyColors: Record<string, string> = {
  critique: '#dc2626',
  eleve: '#f97316',
  moyen: '#eab308',
  faible: '#22c55e',
}

function getMarkerIcon(urgency: string) {
  const color = urgencyColors[urgency] ?? '#3b82f6'
  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
    className: '',
  })
}

interface AlertMapProps {
  alert: Alert
  height?: string
}

export default function AlertMap({ alert, height = '320px' }: AlertMapProps) {
  if (!alert.latitude || !alert.longitude) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200"
      >
        <div className="text-center text-slate-400">
          <div className="text-3xl mb-2">📍</div>
          <p className="text-sm">Localisation non disponible</p>
        </div>
      </div>
    )
  }

  const position: [number, number] = [alert.latitude, alert.longitude]

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <Marker position={position} icon={getMarkerIcon(alert.niveau_urgence)}>
          <Popup>
            <div className="text-xs space-y-1 min-w-36">
              <p className="font-semibold text-sm">{alertTypeLabel(alert.type_alerte)}</p>
              <p>Urgence : {urgencyLabel(alert.niveau_urgence)}</p>
              {alert.users && (
                <p>Utilisateur : {alert.users.prenom} {alert.users.nom}</p>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline block pt-1"
              >
                Ouvrir l'itinéraire ↗
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
