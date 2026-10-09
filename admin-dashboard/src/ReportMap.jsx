import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const COLORS = {
  Pending: '#f59e0b',
  'In Progress': '#2563eb',
  Resolved: '#16a34a',
}

// Zooms the map to fit the markers when the number of points changes.
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 14)
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] })
    }
  }, [points.length]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function ReportMap({ reports }) {
  const located = reports.filter((r) => r.latitude != null && r.longitude != null)
  const points = located.map((r) => [r.latitude, r.longitude])
  const missing = reports.length - located.length

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {located.map((r) => (
          <CircleMarker
            key={r.id}
            center={[r.latitude, r.longitude]}
            radius={10}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: COLORS[r.status] || '#64748b',
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <strong>{r.title}</strong>
              <br />
              {r.category}
              <br />
              Status: {r.status}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {missing > 0 && (
        <div className="absolute bottom-2 left-2 z-[1000] rounded bg-white/90 px-2 py-1 text-xs text-slate-600 shadow">
          {missing} report(s) without GPS are not shown
        </div>
      )}
    </div>
  )
}