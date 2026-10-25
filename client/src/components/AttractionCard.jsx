import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Plus, Check, Info, Star, ThumbsUp } from 'lucide-react';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

const CATEGORY_META = {
  beach:       { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.25)' },
  religious:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)' },
  nature:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)' },
  heritage:    { color: '#f97316', bg: 'rgba(249,115,22,0.1)',   border: 'rgba(249,115,22,0.25)' },
  wildlife:    { color: '#84cc16', bg: 'rgba(132,204,22,0.1)',   border: 'rgba(132,204,22,0.25)' },
  museum:      { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)' },
  recreation:  { color: '#14b8a6', bg: 'rgba(20,184,166,0.1)',   border: 'rgba(20,184,166,0.25)' },
  default:     { color: '#14b8a6', bg: 'rgba(20,184,166,0.1)',   border: 'rgba(20,184,166,0.25)' },
};

export default function AttractionCard({ attraction, isInPlan, onTogglePlan }) {
  const id = attraction.id || attraction._id;
  const image = attraction.images?.[0] ||
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  const catKey = attraction.category?.toLowerCase() || 'default';
  const meta   = CATEGORY_META[catKey] || CATEGORY_META.default;

  const avgRating = attraction.avgRating || 0;
  const reviewCount = attraction.reviewCount || 0;
  const recPercentage = attraction.recommendationPercentage || 0;

  return (
    <div className="attraction-card">
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={resolveImageUrl(image)}
          alt={attraction.name}
          loading="lazy"
          onError={handleImageError}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(5,10,20,0.85) 0%, transparent 50%)',
        }} />

        {/* Category badge */}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 10px', borderRadius: 999,
          background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
          backdropFilter: 'blur(8px)', textTransform: 'capitalize'
        }}>
          {attraction.category}
        </span>

        {/* Distance badge */}
        <span style={{
          position: 'absolute', top: 12, right: 12,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(5,10,20,0.75)', color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.6875rem', fontWeight: 600,
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <MapPin size={11} style={{ color: 'var(--text-accent)' }} />
          {attraction.distanceKm} km
        </span>

        {/* Rating and recommendation badge overlay on bottom of photo */}
        <div style={{
          position: 'absolute', bottom: 10, left: 12, right: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          {reviewCount > 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 8px', borderRadius: 6,
              background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700
            }}>
              <Star size={12} fill="#f59e0b" />
              <span>{avgRating.toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500 }}>
                ({reviewCount})
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', background: 'rgba(5,10,20,0.7)', padding: '2px 6px', borderRadius: 4 }}>
              New Destination
            </span>
          )}

          {recPercentage >= 75 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6,
              background: 'rgba(16,185,129,0.2)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399', fontSize: '0.6875rem', fontWeight: 700
            }}>
              <ThumbsUp size={10} />
              {recPercentage}% Recommend
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 6, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {attraction.name}
        </h3>
        <p style={{
          fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 16, flex: 1
        }}>
          {attraction.shortDescription}
        </p>

        {/* Meta row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
          marginBottom: 12
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Clock size={13} style={{ color: 'var(--text-accent)' }} />
            {attraction.visitDurationMinutes || 60} min
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {attraction.entranceFee || 'Free'}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Link
            to={`/attractions/${id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 12px', borderRadius: 10,
              background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            <Info size={14} style={{ color: 'var(--text-accent)' }} />
            Details
          </Link>

          <button
            onClick={() => onTogglePlan(attraction)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 12px', borderRadius: 10,
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              transition: 'all 0.2s ease',
              ...(isInPlan
                ? {
                    background: 'rgba(16,185,129,0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }
                : {
                    background: 'linear-gradient(135deg, #14b8a6, #10b981)',
                    color: '#050d10',
                    boxShadow: '0 2px 12px rgba(20,184,166,0.3)',
                  }
              ),
            }}
          >
            {isInPlan
              ? <><Check size={14} /> In Plan</>
              : <><Plus size={14} /> Add Plan</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
