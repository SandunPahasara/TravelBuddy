import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Star, ThumbsUp, Camera,
  Edit3, Trash2, CheckCircle2, AlertCircle, ArrowLeft,
  MapPin, Clock, MessageSquare, ExternalLink, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LightboxModal from '../components/LightboxModal';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

export default function UserProfile() {
  const { id } = useParams(); // If present, viewing public profile of another user
  const navigate = useNavigate();
  const { user: currentUser, token, updateUser, openAuthModal } = useAuth();

  const isOwnProfile = !id || (currentUser && (currentUser.id === id || currentUser._id === id));
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'recommendations' | 'photos' | 'edit'

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');

  // Lightbox state for user-uploaded photos
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load profile data
  const loadProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (isOwnProfile) {
        if (!token) {
          setLoading(false);
          return;
        }
        // Fetch current user details & reviews
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Also fetch reviews and recommendations for self
          const pubRes = await fetch(`/api/users/${data.user.id}`);
          const pubData = await pubRes.json();

          setProfileData({
            ...data.user,
            reviews: pubData.success ? pubData.user.reviews : [],
            recommendations: pubData.success ? pubData.user.recommendations : []
          });
          setEditName(data.user.name || '');
          setEditBio(data.user.bio || '');
          setEditAvatar(data.user.profilePicture || '');
        } else {
          setErrorMsg(data.error || 'Failed to load profile');
        }
      } else {
        // Viewing public user profile
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProfileData(data.user);
        } else {
          setErrorMsg(data.error || 'User not found');
        }
      }
    } catch (err) {
      setErrorMsg('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id, token, isOwnProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditSuccess('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          bio: editBio.trim(),
          profilePicture: editAvatar.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setEditSuccess('Your profile has been updated!');
      updateUser(data.user);
      setProfileData(prev => ({
        ...prev,
        name: data.user.name,
        bio: data.user.bio,
        profilePicture: data.user.profilePicture
      }));
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Remove from local reviews state
        setProfileData(prev => ({
          ...prev,
          reviews: prev.reviews.filter(r => r._id !== reviewId),
          stats: {
            ...prev.stats,
            reviewsCount: Math.max(0, (prev.stats?.reviewsCount || 1) - 1)
          }
        }));
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch {
      alert('Network error while deleting review');
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ paddingTop: 80, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading user profile...</p>
      </div>
    );
  }

  if (isOwnProfile && !currentUser) {
    return (
      <div className="page-container" style={{ paddingTop: 80, textAlign: 'center' }}>
        <User size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Please Sign In
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          You must be logged in to view and manage your profile.
        </p>
        <button onClick={() => openAuthModal('login')} className="btn-primary">
          Sign In to TravelBuddy
        </button>
      </div>
    );
  }

  if (errorMsg || !profileData) {
    return (
      <div className="page-container" style={{ paddingTop: 80, textAlign: 'center' }}>
        <AlertCircle size={44} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Profile Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          {errorMsg || 'The requested user profile does not exist.'}
        </p>
        <Link to="/explore" className="btn-secondary">
          Explore Attractions
        </Link>
      </div>
    );
  }

  const reviews = profileData.reviews || [];
  const recommendations = profileData.recommendations || [];
  const stats = profileData.stats || { reviewsCount: reviews.length, recommendationsCount: recommendations.length, averageRatingGiven: 0 };

  // Collect all photos uploaded across user's reviews
  const allUserPhotos = [];
  reviews.forEach(r => {
    if (r.images && r.images.length > 0) {
      r.images.forEach(img => {
        allUserPhotos.push({
          url: img.url,
          caption: `${r.title} - ${r.placeId?.name || 'Attraction'}`,
          altText: 'User review photograph'
        });
      });
    }
  });

  const memberSince = profileData.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'October 2026';

  return (
    <div className="page-container animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 600,
          marginBottom: 20, padding: 0
        }}
      >
        <ArrowLeft size={16} style={{ color: 'var(--text-accent)' }} /> Back
      </button>

      {/* ── User Header Card ── */}
      <div className="glass-card" style={{ padding: '32px 30px', borderRadius: 20, marginBottom: 28, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent-teal)', flexShrink: 0 }}>
            <img
              src={resolveImageUrl(profileData.profilePicture, `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileData.name)}`)}
              alt={profileData.name}
              onError={handleImageError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {profileData.name}
              </h1>
              {profileData.role === 'admin' && (
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(20,184,166,0.15)', border: '1px solid var(--border-accent)',
                  color: 'var(--text-accent)', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4
                }}>
                  <Shield size={12} /> Administrator
                </span>
              )}
            </div>

            {profileData.bio && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 6, maxWidth: 640, lineHeight: 1.6 }}>
                {profileData.bio}
              </p>
            )}

            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} style={{ color: 'var(--text-accent)' }} />
                Member since {memberSince}
              </span>
              {isOwnProfile && profileData.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} style={{ color: 'var(--text-accent)' }} />
                  {profileData.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12,
          marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-accent)' }}>
              {stats.reviewsCount || reviews.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
              Reviews Posted
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {stats.recommendationsCount || recommendations.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
              Places Recommended
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              {stats.averageRatingGiven ? `${stats.averageRatingGiven} ★` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
              Avg Rating Given
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06b6d4' }}>
              {allUserPhotos.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
              Photos Shared
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, overflowX: 'auto' }}>
        {[
          { key: 'reviews',         label: `Reviews (${reviews.length})`,                 icon: MessageSquare },
          { key: 'recommendations', label: `Recommended Places (${recommendations.length})`, icon: ThumbsUp },
          { key: 'photos',          label: `Photo Gallery (${allUserPhotos.length})`,     icon: Camera },
          ...(isOwnProfile ? [{ key: 'edit', label: 'Edit Profile', icon: Edit3 }] : [])
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '10px 18px', borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              border: activeTab === key ? '1px solid var(--border-accent)' : '1px solid transparent',
              background: activeTab === key ? 'rgba(20,184,166,0.15)' : 'none',
              color: activeTab === key ? 'var(--text-accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Reviews List ── */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: 16 }}>
              <MessageSquare size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {isOwnProfile ? "You haven't submitted any reviews yet." : 'No reviews submitted by this user yet.'}
              </p>
              {isOwnProfile && (
                <Link to="/explore" className="btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
                  Explore Attractions to Review
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(review => {
                const place = review.placeId;
                return (
                  <div key={review._id} className="glass-card" style={{ padding: '22px 24px', borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                      <div>
                        {place && (
                          <Link
                            to={`/attractions/${place._id}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-accent)',
                              textDecoration: 'none', marginBottom: 4
                            }}
                          >
                            <MapPin size={15} /> {place.name}
                          </Link>
                        )}
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                          {review.title}
                        </h3>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: 8, color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                          <Star size={14} fill="#f59e0b" />
                          <span>{review.rating}.0</span>
                        </div>

                        {review.recommendationStatus === 'Recommended' && (
                          <span style={{
                            padding: '4px 10px', borderRadius: 8,
                            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                            color: '#34d399', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4
                          }}>
                            <ThumbsUp size={12} /> Recommended
                          </span>
                        )}

                        {isOwnProfile && (
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#ef4444', padding: 4, display: 'flex', alignItems: 'center'
                            }}
                            title="Delete this review"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12 }}>
                      {review.reviewText}
                    </p>

                    {/* Review photos */}
                    {review.images && review.images.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12 }}>
                        {review.images.map((img, i) => (
                          <div
                            key={i}
                            style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
                            onClick={() => {
                              setLightboxIndex(0);
                              setLightboxOpen(true);
                            }}
                          >
                            <img
                              src={resolveImageUrl(img.url)}
                              alt=""
                              onError={handleImageError}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                      <span>
                        {review.visitDate ? `Visited: ${review.visitDate}` : `Posted: ${new Date(review.createdAt).toLocaleDateString()}`}
                      </span>
                      {place && (
                        <Link to={`/attractions/${place._id}`} style={{ color: 'var(--text-accent)', textDecoration: 'none', fontWeight: 600 }}>
                          View Place Details &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Recommendations List ── */}
      {activeTab === 'recommendations' && (
        <div>
          {recommendations.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: 16 }}>
              <ThumbsUp size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {isOwnProfile ? "You haven't recommended any places yet." : 'No recommendations submitted by this user yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {recommendations.map(rec => {
                const place = rec.placeId;
                if (!place) return null;
                const img = place.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
                return (
                  <div key={rec._id} className="glass-card" style={{ borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 160, position: 'relative' }}>
                      <img
                        src={resolveImageUrl(img)}
                        alt={place.name}
                        onError={handleImageError}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute', top: 10, left: 10,
                        padding: '3px 8px', borderRadius: 999,
                        background: 'rgba(5,10,20,0.8)', color: 'var(--text-accent)',
                        fontSize: '0.7rem', fontWeight: 700, border: '1px solid var(--border-accent)'
                      }}>
                        {place.category}
                      </span>
                    </div>
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                          {place.name}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Recommended on {new Date(rec.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/attractions/${place._id}`}
                        className="btn-secondary"
                        style={{ marginTop: 12, justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px', borderRadius: 8 }}
                      >
                        Explore Attraction
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Photo Gallery ── */}
      {activeTab === 'photos' && (
        <div>
          {allUserPhotos.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: 16 }}>
              <Camera size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No review photographs uploaded yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {allUserPhotos.map((photo, i) => (
                <div
                  key={i}
                  style={{
                    height: 180, borderRadius: 12, overflow: 'hidden',
                    cursor: 'pointer', position: 'relative', border: '1px solid var(--border-subtle)'
                  }}
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={resolveImageUrl(photo.url)}
                    alt={photo.caption}
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                    display: 'flex', alignItems: 'flex-end', padding: 10
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {photo.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Edit Profile Form (Owner only) ── */}
      {isOwnProfile && activeTab === 'edit' && (
        <div className="glass-card" style={{ padding: '28px 26px', borderRadius: 16, maxWidth: 600 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
            Update Profile Information
          </h2>

          {editSuccess && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
              color: '#6ee7b7', fontSize: '0.8125rem'
            }}>
              <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
              {editSuccess}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="tb-input"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Profile Picture URL
              </label>
              <input
                type="url"
                value={editAvatar}
                onChange={e => setEditAvatar(e.target.value)}
                className="tb-input"
                style={{ width: '100%' }}
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Short Bio / Traveler Introduction
              </label>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                className="tb-input"
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
                placeholder="Tell other travelers about your interests and recommendations..."
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary"
              style={{ width: 'fit-content', padding: '10px 22px', borderRadius: 10 }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Lightbox for review photos */}
      <LightboxModal
        images={allUserPhotos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={idx => setLightboxIndex(idx)}
      />
    </div>
  );
}
