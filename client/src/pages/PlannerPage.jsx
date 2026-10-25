import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Trash2, ArrowUp, ArrowDown, MapPin, Clock,
  Sparkles, Navigation, Plus, AlertCircle
} from 'lucide-react';

export default function PlannerPage({ planAttractions, onRemoveFromPlan, onClearPlan, onReorderPlan }) {
  const [loading, setLoading] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState(null);
  const [orderMode, setOrderMode] = useState('custom');

  const fetchSuggestedOrder = async () => {
    if (planAttractions.length === 0) { setSuggestedOrder(null); return; }
    setLoading(true);
    try {
      const ids = planAttractions.map(a => a.id || a._id);
      const res = await fetch('/api/planner/suggest-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attractionIds: ids }),
      });
      const data = await res.json();
      if (data.success) { setSuggestedOrder(data); setOrderMode('optimized'); }
    } catch (err) {
      console.error('Failed to suggest order', err);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = (index, direction) => {
    const items = [...planAttractions];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    onReorderPlan(items);
    setOrderMode('custom');
  };

  const totalVisitMins = planAttractions.reduce((s, a) => s + (a.visitDurationMinutes || 60), 0);

  // ─── Empty State ─────────────────────────────────────────────────
  if (planAttractions.length === 0) {
    return (
      <div className="page-container animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ maxWidth: 420, width: '100%', padding: '48px 36px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
            background: 'rgba(20,184,166,0.1)', border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Calendar size={30} style={{ color: 'var(--text-accent)' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
            Your Day Plan is Empty
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 24 }}>
            Browse the attractions around Panadura and add them to build your personalised one-day itinerary.
          </p>
          <Link to="/explore" className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12 }}>
            <Plus size={16} /> Explore Attractions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginBottom: 32
      }}>
        <div>
          <h1 style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em'
          }}>
            <Calendar size={26} style={{ color: '#10b981' }} />
            One-Day Visit Planner
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 5 }}>
            Organise your selected spots, optimise your route, and view estimated visit times.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={fetchSuggestedOrder}
            disabled={loading}
            className="btn-primary"
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <Sparkles size={15} />
            {loading ? 'Calculating...' : 'Suggest Best Order'}
          </button>
          <button
            onClick={onClearPlan}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* ── Two-column layout ───────────────────────────────────── */}
      <div className="planner-grid">

        {/* Left: Timeline */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Visiting Order · {planAttractions.length} Places
            </h3>
            {orderMode === 'optimized' && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                background: 'rgba(16,185,129,0.1)', color: '#34d399',
                border: '1px solid rgba(16,185,129,0.25)'
              }}>
                <Sparkles size={12} /> Route Optimised
              </span>
            )}
          </div>

          {/* Optimised mode */}
          {orderMode === 'optimized' && suggestedOrder ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {suggestedOrder.orderedPlan.map((step) => {
                const item = step.attraction;
                return (
                  <div key={item.id || item._id} className="timeline-item">
                    <div className="glass-card" style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <span style={{
                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                            background: 'rgba(20,184,166,0.15)', border: '1px solid var(--border-accent)',
                            color: 'var(--text-accent)', fontWeight: 800, fontSize: '0.8125rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {step.stopNumber}
                          </span>
                          <div>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {item.category}
                            </span>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                              {item.name}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                              {item.shortDescription}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveFromPlan(item.id || item._id)}
                          style={{
                            padding: 8, borderRadius: 8, background: 'none', border: 'none',
                            cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div style={{
                        marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
                        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
                        fontSize: '0.75rem'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                          <Navigation size={12} style={{ color: 'var(--text-accent)' }} />
                          Travel: {step.travelFromPreviousKm} km ({step.travelFromPreviousMin} min)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399', fontWeight: 600 }}>
                          <Clock size={12} />
                          {step.estimatedArrival} → {step.estimatedDeparture}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom order */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {planAttractions.map((item, index) => (
                <div key={item.id || item._id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Reorder buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      style={{
                        padding: 5, borderRadius: 6, background: 'var(--bg-hover)', border: 'none',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        color: 'var(--text-secondary)', opacity: index === 0 ? 0.3 : 1
                      }}
                    ><ArrowUp size={12} /></button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === planAttractions.length - 1}
                      style={{
                        padding: 5, borderRadius: 6, background: 'var(--bg-hover)', border: 'none',
                        cursor: index === planAttractions.length - 1 ? 'not-allowed' : 'pointer',
                        color: 'var(--text-secondary)', opacity: index === planAttractions.length - 1 ? 0.3 : 1
                      }}
                    ><ArrowDown size={12} /></button>
                  </div>

                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {index + 1}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h4>
                    <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{item.category}</span>
                      <span>· {item.distanceKm} km</span>
                      <span>· {item.visitDurationMinutes || 60} min</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromPlan(item.id || item._id)}
                    style={{
                      padding: 8, borderRadius: 8, background: 'none', border: 'none',
                      cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <Link to="/explore" style={{
                  fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-accent)',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5
                }}>
                  <Plus size={14} /> Add more attractions
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Summary card ─── */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{
              fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)',
              paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border-subtle)'
            }}>
              Itinerary Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Attractions</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{planAttractions.length} Spots</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Visit Duration</span>
                <span style={{ fontWeight: 700, color: 'var(--text-accent)' }}>
                  {Math.floor(totalVisitMins / 60)}h {totalVisitMins % 60}m
                </span>
              </div>
              {suggestedOrder && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Travel Distance</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>{suggestedOrder.summary.totalTravelKm} km</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Est. Total Trip Time</span>
                    <span style={{ fontWeight: 700, color: '#22d3ee' }}>{suggestedOrder.summary.formattedTotalDuration}</span>
                  </div>
                </>
              )}
            </div>

            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', marginBottom: 6 }}>
                <AlertCircle size={14} /> Day Visit Guidance
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Estimated start time: 08:30 AM from Panadura Town. Travel times are based on average traffic speeds.
              </p>
            </div>

            <Link
              to="/map"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '13px 16px' }}
            >
              <MapPin size={15} /> View Route on Map
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .planner-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
