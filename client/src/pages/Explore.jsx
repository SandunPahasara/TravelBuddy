import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, Frown, SlidersHorizontal, Star, ThumbsUp, ArrowUpDown } from 'lucide-react';
import AttractionCard from '../components/AttractionCard';

const CATEGORIES = ['All', 'Beach', 'Nature', 'Religious', 'Heritage', 'Wildlife', 'Museum', 'Recreation'];
const DISTANCES  = [
  { label: 'Any Distance', value: 'All' },
  { label: '< 5 km',       value: '5'   },
  { label: '< 15 km',      value: '15'  },
  { label: '< 25 km',      value: '25'  },
];
const RATING_FILTERS = [
  { label: 'All Ratings', value: '0' },
  { label: '4.5★ & Above', value: '4.5' },
  { label: '4.0★ & Above', value: '4.0' },
  { label: '3.0★ & Above', value: '3.0' }
];

export default function Explore({ attractions, planIds, onTogglePlan }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDistance, setSelectedDistance] = useState('All');
  const [selectedRating, setSelectedRating] = useState('0');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'featured');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    const s = searchParams.get('sortBy');
    if (s) setSortBy(s);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = attractions.filter((item) => {
      if (selectedCategory !== 'All') {
        const ok = item.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                   selectedCategory.toLowerCase().includes(item.category.toLowerCase());
        if (!ok) return false;
      }
      if (selectedDistance !== 'All' && item.distanceKm > parseFloat(selectedDistance)) return false;
      if (selectedRating !== '0' && (item.avgRating || 0) < parseFloat(selectedRating)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) &&
            !item.shortDescription.toLowerCase().includes(q) &&
            !item.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'recommended') {
      result.sort((a, b) => (b.recommendationCount || 0) - (a.recommendationCount || 0) || (b.recommendationPercentage || 0) - (a.recommendationPercentage || 0));
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'distance') {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [attractions, selectedCategory, selectedDistance, selectedRating, sortBy, searchQuery]);

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedDistance('All');
    setSelectedRating('0');
    setSortBy('featured');
    setSearchQuery('');
    setSearchParams({});
  };

  const isFiltered = selectedCategory !== 'All' || selectedDistance !== 'All' || selectedRating !== '0' || searchQuery.trim() !== '' || sortBy !== 'featured';

  return (
    <div className="page-container animate-fadeIn">

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Explore Attractions
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 5 }}>
          Browse destinations within 25 km of Panadura — filter by category, distance, verified ratings, or search.
        </p>
      </div>

      {/* Filter Panel */}
      <div className="glass-card" style={{ padding: '20px 22px', marginBottom: 24, borderRadius: 18 }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search attractions by name, description or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-glass"
            style={{ paddingLeft: 38 }}
          />
        </div>

        {/* Category chips */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <SlidersHorizontal size={12} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Category
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`filter-chip${selectedCategory === cat ? ' active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Distance + Rating + Sort Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16,
          paddingTop: 14, borderTop: '1px solid var(--border-subtle)', alignItems: 'center'
        }}>
          {/* Distance */}
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Distance Radius
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DISTANCES.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDistance(opt.value)}
                  className={`filter-chip${selectedDistance === opt.value ? ' active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Minimum Star Rating
            </div>
            <select
              value={selectedRating}
              onChange={e => setSelectedRating(e.target.value)}
              className="tb-input"
              style={{ width: '100%', fontSize: '0.8rem', padding: '6px 10px' }}
            >
              {RATING_FILTERS.map(rf => (
                <option key={rf.value} value={rf.value}>{rf.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              <ArrowUpDown size={12} /> Sort By
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="tb-input"
              style={{ width: '100%', fontSize: '0.8rem', padding: '6px 10px' }}
            >
              <option value="featured">Featured / Default</option>
              <option value="rating">Highest Star Rating</option>
              <option value="recommended">Most Recommended</option>
              <option value="reviews">Most Reviewed</option>
              <option value="distance">Closest to Panadura</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8,
                background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              <RotateCcw size={13} style={{ color: 'var(--text-accent)' }} />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results count & badges */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, fontSize: '0.8125rem', color: 'var(--text-secondary)',
        flexWrap: 'wrap', gap: 8
      }}>
        <span>
          Showing{' '}
          <strong style={{ color: 'var(--text-accent)', fontWeight: 700 }}>{filtered.length}</strong>
          {' '}attraction{filtered.length !== 1 ? 's' : ''}
        </span>
        {isFiltered && (
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
            background: 'rgba(20,184,166,0.1)', color: 'var(--text-accent)',
            border: '1px solid var(--border-accent)'
          }}>
            Active Filters
          </span>
        )}
      </div>

      {/* Grid / empty state */}
      {filtered.length > 0 ? (
        <div className="grid-cards">
          {filtered.map((item) => (
            <AttractionCard
              key={item.id || item._id}
              attraction={item}
              isInPlan={planIds.includes(item.id || item._id)}
              onTogglePlan={onTogglePlan}
            />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '56px 24px', textAlign: 'center',
          border: '1px dashed var(--border-glass)', borderRadius: 18,
          maxWidth: 400, margin: '0 auto'
        }}>
          <Frown size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            No attractions found
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Try adjusting or clearing your filters to see more results.
          </p>
          <button onClick={handleReset} className="btn-primary">
            <RotateCcw size={14} /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
