import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Heart } from 'lucide-react';

const CATEGORIES = ['Beach', 'Nature', 'Religious', 'Heritage', 'Wildlife', 'Museum', 'Recreation'];

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px clamp(16px, 2.5vw, 44px) 24px',
      marginTop: 'auto',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: 'var(--container-max-width)', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 32, marginBottom: 36
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #14b8a6, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Compass size={18} color="#050d10" />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              TravelBuddy
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 260 }}>
            Local Tourist Day-Visit Planner &amp; Information System for Panadura, Sri Lanka.
            Discover beaches, temples, nature sanctuaries and museums within 25 km.
          </p>
        </div>

        {/* Reference */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Core Reference
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: MapPin, text: 'Panadura Town (6.6991, 79.9304)' },
              { icon: null,   text: 'Radius Constraint: ~25 km' },
              { icon: null,   text: 'Module: ITE2953 · 25S1' },
              { icon: null,   text: 'SRS v1.0 Compliant' },
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {Icon && <Icon size={13} style={{ color: 'var(--text-accent)', flexShrink: 0 }} />}
                {!Icon && <span style={{ width: 13, display: 'inline-block', flexShrink: 0 }} />}
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              { to: '/',        label: 'Home' },
              { to: '/explore', label: 'Explore Places' },
              { to: '/map',     label: 'Interactive Map' },
              { to: '/planner', label: 'Day Planner' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} style={{
                  fontSize: '0.8125rem', color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Categories
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                to={`/explore?category=${cat}`}
                style={{
                  padding: '4px 10px', borderRadius: 8,
                  background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--text-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)', paddingTop: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          © 2026 Panadura Local Tourist Information System. All rights reserved.
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Crafted for ITE2953 with <Heart size={12} style={{ color: '#ef4444', fill: '#ef4444' }} /> in Sri Lanka
        </p>
      </div>
    </footer>
  );
}
