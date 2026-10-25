import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, MapPin } from 'lucide-react';

// Fix Leaflet marker icon URLs in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 14, { animate: true });
  }, [lat, lng, map]);
  return null;
}

const CATEGORIES = ['All', 'Beach', 'Nature', 'Religious', 'Heritage', 'Wildlife', 'Museum', 'Recreation'];

export default function MapPage({ attractions, planIds, onTogglePlan }) {
  const [searchParams] = useSearchParams();
  const focusedId = searchParams.get('focus');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const focusedAttraction = attractions.find(a => a.id === focusedId || a._id?.toString() === focusedId);
  const centerLat = focusedAttraction ? focusedAttraction.latitude  : 6.6991;
  const centerLng = focusedAttraction ? focusedAttraction.longitude : 79.9304;

  const filtered = selectedCategory === 'All'
    ? attractions
    : attractions.filter(a => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="page-container animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em'
          }}>
            <Compass size={26} style={{ color: 'var(--text-accent)' }} />
            Interactive Map View
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 5 }}>
            Geographical locations of attractions within 25 km of Panadura.
          </p>
        </div>

        {/* Category filter chips */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          padding: '8px 10px', borderRadius: 14,
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`filter-chip${selectedCategory === cat ? ' active' : ''}`}
              style={{ padding: '5px 12px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', height: 'clamp(540px, 68vh, 720px)', borderRadius: 20,
        overflow: 'hidden', border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={focusedAttraction ? 14 : 11}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={focusedAttraction?.latitude} lng={focusedAttraction?.longitude} />

          {filtered.map((spot) => {
            const id = spot.id || spot._id;
            const inPlan = planIds.includes(id);
            return (
              <Marker key={id} position={[spot.latitude, spot.longitude]}>
                <Popup>
                  <div style={{ padding: 4, maxWidth: 220 }}>
                    <img
                      src={spot.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'}
                      alt={spot.name}
                      style={{ width: '100%', height: 96, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                    />
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 6
                    }}>
                      {spot.category}
                    </span>
                    <h4 style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginTop: 6, lineHeight: 1.3 }}>
                      {spot.name}
                    </h4>
                    <p style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>
                      {spot.distanceKm} km from Panadura
                    </p>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                      <Link
                        to={`/attractions/${id}`}
                        style={{
                          flex: 1, padding: '5px 8px', borderRadius: 8,
                          background: '#f1f5f9', color: '#334155',
                          fontSize: 11, fontWeight: 600, textAlign: 'center', textDecoration: 'none'
                        }}
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => onTogglePlan(spot)}
                        style={{
                          padding: '5px 10px', borderRadius: 8,
                          background: inPlan ? '#10b981' : '#14b8a6',
                          color: 'white', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer'
                        }}
                      >
                        {inPlan ? '✓ In Plan' : '+ Plan'}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Info overlay */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 400,
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(8,12,22,0.88)', border: '1px solid var(--border-glass)',
          backdropFilter: 'blur(10px)', fontSize: '0.75rem', color: 'var(--text-secondary)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-accent)', fontWeight: 700, marginBottom: 4 }}>
            <MapPin size={12} /> Panadura Reference Point
          </span>
          <span>Lat: 6.6991, Lng: 79.9304 · Showing {filtered.length} spots</span>
        </div>
      </div>
    </div>
  );
}
