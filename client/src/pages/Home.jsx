import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass, MapPin, Calendar, ArrowRight,
  Waves, Trees, Landmark, Building2, Bird, Utensils,
  TrendingUp, Clock, Star, Sparkles, Sun, CheckCircle2,
  ThumbsUp, Tv, MessageSquare, Play, Search, Filter, Camera
} from 'lucide-react';
import AttractionCard from '../components/AttractionCard';
import VideoPlayerModal from '../components/VideoPlayerModal';

const CATEGORIES = [
  { name: 'Beach',      icon: Waves,      gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)', sub: 'Coast & Sunset' },
  { name: 'Religious',  icon: Landmark,   gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', sub: 'Temples & Stupas' },
  { name: 'Recreation', icon: Sparkles,   gradient: 'linear-gradient(135deg,#06b6d4,#10b981)', sub: 'Parks & Walking' },
  { name: 'Nature',     icon: Trees,      gradient: 'linear-gradient(135deg,#10b981,#14b8a6)', sub: 'Lakes & Greenery' },
  { name: 'Heritage',   icon: Building2,  gradient: 'linear-gradient(135deg,#f97316,#ef4444)', sub: 'Historic Sites' },
  { name: 'Wildlife',   icon: Bird,       gradient: 'linear-gradient(135deg,#84cc16,#10b981)', sub: 'Sanctuaries' },
  { name: 'Museum',     icon: Utensils,   gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)', sub: 'Air Force Museum' },
];

const STATS = [
  { value: '10+',   label: 'Curated Spots',  icon: Star,       color: '#2dd4bf' },
  { value: '25 km', label: 'Local Radius',   icon: MapPin,     color: '#34d399' },
  { value: 'Smart', label: 'Route Planner',  icon: TrendingUp, color: '#22d3ee' },
];

export default function Home({ attractions, planIds, onTogglePlan }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSections, setFeaturedSections] = useState({
    topRated: [],
    mostRecommended: [],
    mostReviewed: [],
    recentlyReviewed: []
  });
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Fetch real database aggregated sections
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const res = await fetch('/api/attractions/featured-sections');
        const data = await res.json();
        if (data.success && data.data) {
          setFeaturedSections(data.data);
        }

        const vidRes = await fetch('/api/videos/featured');
        const vidData = await vidRes.json();
        if (vidData.success && vidData.data) {
          setFeaturedVideos(vidData.data);
        }
      } catch (err) {
        console.error('Failed to load featured homepage sections:', err);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="page-container animate-fadeIn">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-section" style={{ marginBottom: 48 }}>
        {/* BG image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(110deg, var(--bg-primary) 30%, rgba(8,12,22,0.85) 65%, rgba(8,12,22,0.42) 100%)',
        }} />

        <div className="hero-content">
          {/* Left: Headline & Intro */}
          <div className="hero-text">
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999,
              background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.32)',
              color: 'var(--text-accent)', fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18
            }}>
              <Compass size={14} />
              Panadura · 25 km Radius Day-Visit Platform
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 3.8vw, 3.4rem)', fontWeight: 900,
              lineHeight: 1.1, letterSpacing: '-0.03em',
              color: 'var(--text-primary)', marginBottom: 16
            }}>
              Explore <span className="gradient-text">Panadura</span>
              <br />&amp; Nearby Attractions
            </h1>

            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, maxWidth: 620 }}>
              Discover historic temples, pristine beaches, scenic lakes, and wildlife sanctuaries.
              Watch travel videos, read authentic visitor experiences, and plan your day visit.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, maxWidth: 500, marginBottom: 28 }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search beaches, temples, castle, lake..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', paddingLeft: 40, height: 44, borderRadius: 12 }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ height: 44, padding: '0 20px', borderRadius: 12 }}>
                Search
              </button>
            </form>

            <div className="hero-btn-row" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.9375rem' }}>
                Explore All Places <ArrowRight size={17} />
              </Link>
              <Link to="/planner" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '0.9375rem' }}>
                <Calendar size={17} style={{ color: 'var(--accent-teal)' }} />
                Build Day Plan
              </Link>
            </div>

            {/* Stats */}
            <div className="stat-row" style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
              {STATS.map(({ value, label, icon: Icon, color }) => (
                <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(20, 184, 166, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Hero Spotlight Card */}
          <div className="hero-spotlight">
            <div className="hero-spotlight-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#10b981', display: 'inline-block',
                    boxShadow: '0 0 8px #10b981'
                  }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-accent)' }}>
                    Panadura Highlights
                  </span>
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  background: 'var(--bg-glass)', padding: '4px 10px', borderRadius: 999,
                  border: '1px solid var(--border-subtle)'
                }}>
                  <Sun size={13} style={{ color: '#f59e0b' }} />
                  29°C · Sunny Coast
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                Top Day-Trip Recommendations
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Featured spots within 25 km of Panadura Clock Tower:
              </p>

              {/* Spotlight list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {[
                  { name: 'Panadura Beach', cat: 'Beach', dist: '4.6 km', rating: '4.7 ★' },
                  { name: 'Rankoth Viharaya', cat: 'Religious', dist: '4.4 km', rating: '5.0 ★' },
                  { name: 'Bolgoda Lake', cat: 'Nature', dist: '15 km', rating: '5.0 ★' },
                ].map((spot, idx) => (
                  <div key={spot.name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 12,
                    background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: 'rgba(20, 184, 166, 0.15)',
                        color: 'var(--text-accent)', fontSize: '0.75rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{spot.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{spot.cat} · {spot.dist}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      color: '#f59e0b', background: 'rgba(245,158,11,0.12)',
                      padding: '3px 8px', borderRadius: 6
                    }}>
                      {spot.rating}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer CTA */}
              <Link to="/planner" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px', borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-emerald))',
                color: '#050d10', fontSize: '0.8125rem', fontWeight: 700,
                textDecoration: 'none', transition: 'filter 0.2s'
              }}>
                <Sparkles size={14} /> Start Building Day Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section style={{ marginBottom: 52 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Discover Panadura and surrounding spots matched to your travel interests</p>
          </div>
          <Link to="/explore" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-accent)', textDecoration: 'none'
          }}>
            View All Categories <ArrowRight size={15} />
          </Link>
        </div>

        <div className="category-grid">
          {CATEGORIES.map(({ name, icon: Icon, gradient, sub }) => {
            const count = attractions.filter(a =>
              a.category && a.category.toLowerCase().includes(name.toLowerCase())
            ).length;

            return (
              <Link key={name} to={`/explore?category=${name}`} className="category-card">
                <div className="category-icon-box" style={{ background: gradient }}>
                  <Icon size={24} color="white" />
                </div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {sub}
                </span>
                {count > 0 && (
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600,
                    padding: '2px 8px', borderRadius: 999,
                    background: 'var(--bg-hover)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {count} {count === 1 ? 'place' : 'places'}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Top-Rated Tourist Places Section ──────────────────────── */}
      {featuredSections.topRated && featuredSections.topRated.length > 0 && (
        <section style={{ marginBottom: 52 }}>
          <div className="section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                <Star size={14} fill="#f59e0b" /> Verified Visitor Ratings
              </div>
              <h2 className="section-title">Top-Rated Tourist Places</h2>
              <p className="section-subtitle">Highest rated destinations calculated directly from authentic visitor reviews</p>
            </div>
            <Link to="/explore?sortBy=rating" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-accent)', textDecoration: 'none'
            }}>
              See all rated <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-cards">
            {featuredSections.topRated.slice(0, 4).map(item => (
              <AttractionCard
                key={item.id || item._id}
                attraction={item}
                isInPlan={planIds.includes(item.id || item._id)}
                onTogglePlan={onTogglePlan}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Most Recommended Destinations Section ─────────────────── */}
      {featuredSections.mostRecommended && featuredSections.mostRecommended.length > 0 && (
        <section style={{ marginBottom: 52 }}>
          <div className="section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                <ThumbsUp size={14} /> Community Choice
              </div>
              <h2 className="section-title">Most Recommended Destinations</h2>
              <p className="section-subtitle">Spots with the highest recommendation percentage from travelers</p>
            </div>
            <Link to="/explore?sortBy=recommended" style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-accent)', textDecoration: 'none'
            }}>
              View all recommended <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-cards">
            {featuredSections.mostRecommended.slice(0, 4).map(item => (
              <AttractionCard
                key={item.id || item._id}
                attraction={item}
                isInPlan={planIds.includes(item.id || item._id)}
                onTogglePlan={onTogglePlan}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Recently Reviewed Places Section ──────────────────────── */}
      {featuredSections.recentlyReviewed && featuredSections.recentlyReviewed.length > 0 && (
        <section style={{ marginBottom: 52 }}>
          <div className="section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-accent)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                <MessageSquare size={14} /> Real Visitor Experiences
              </div>
              <h2 className="section-title">Recently Reviewed Places</h2>
              <p className="section-subtitle">Recent stories, visitor tips, and ratings shared by community members</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {featuredSections.recentlyReviewed.map(place => (
              <Link
                key={place._id}
                to={`/attractions/${place._id}`}
                className="glass-card"
                style={{
                  padding: 20, borderRadius: 16, textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-accent)' }}>
                      {place.category}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: '0.8rem', fontWeight: 800 }}>
                      <Star size={13} fill="#f59e0b" />
                      {place.latestReview?.rating || place.avgRating || 5}.0
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {place.name}
                  </h3>

                  {place.latestReview && (
                    <p style={{
                      fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic',
                      lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      "{place.latestReview.title}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Reviewed by {place.latestReview?.userName || 'Visitor'}</span>
                  <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>Read Review &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Travel Videos Section ────────────────────────── */}
      {featuredVideos && featuredVideos.length > 0 && (
        <section style={{ marginBottom: 52 }}>
          <div className="section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                <Tv size={14} /> Video Walkthroughs
              </div>
              <h2 className="section-title">Featured Travel Videos</h2>
              <p className="section-subtitle">Experience Panadura coastlines, temples, and lakes through travel vlogs</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {featuredVideos.map(video => (
              <div
                key={video._id}
                onClick={() => {
                  setSelectedVideo(video);
                  setVideoModalOpen(true);
                }}
                className="glass-card"
                style={{
                  borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div style={{ height: 160, position: 'relative', background: '#000' }}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(239,68,68,0.9)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.6)'
                    }}>
                      <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                  <span style={{
                    position: 'absolute', bottom: 8, left: 8,
                    padding: '2px 8px', borderRadius: 4,
                    background: 'rgba(0,0,0,0.75)', color: 'var(--text-accent)',
                    fontSize: '0.6875rem', fontWeight: 700
                  }}>
                    {video.place?.name}
                  </span>
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <h3 style={{
                    fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    lineHeight: 1.35, marginBottom: 4
                  }}>
                    {video.title}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{video.channelName}</span>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{video.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section style={{
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(16,185,129,0.06) 100%)',
        border: '1px solid var(--border-accent)',
        padding: 'clamp(24px, 4vw, 44px) clamp(20px, 4vw, 44px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 560, position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(20,184,166,0.14)', color: 'var(--text-accent)',
            border: '1px solid var(--border-accent)', fontSize: '0.75rem', fontWeight: 700,
            marginBottom: 12
          }}>
            <MapPin size={12} /> Interactive Map &amp; Route Order
          </span>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.625rem)', fontWeight: 800,
            color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 10
          }}>
            Plan your complete one-day tour with intelligent route suggestions
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            Select attractions, view estimated travel times, and let TravelBuddy suggest
            the optimal visiting order from Panadura town center.
          </p>
        </div>
        <div className="cta-btn-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Link to="/map" className="btn-primary">
            Open Map <ArrowRight size={15} />
          </Link>
          <Link to="/planner" className="btn-secondary">
            <Clock size={15} style={{ color: 'var(--accent-teal)' }} />
            Day Planner
          </Link>
        </div>
      </section>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setSelectedVideo(null);
        }}
      />
    </div>
  );
}
