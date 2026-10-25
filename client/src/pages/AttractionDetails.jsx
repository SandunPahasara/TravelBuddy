import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, DollarSign, Check, Plus, ArrowLeft,
  Lightbulb, Car, CheckCircle2, Star, ThumbsUp, Camera,
  Tv, MessageSquare, AlertCircle, Edit2, Trash2, Flag,
  ChevronRight, Play, ExternalLink, Shield, PlusCircle,
  Sparkles, Accessibility, Building, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LightboxModal from '../components/LightboxModal';
import VideoPlayerModal from '../components/VideoPlayerModal';
import FeedbackModal from '../components/FeedbackModal';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

export default function AttractionDetails({ attractions, planIds, onTogglePlan }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAdmin, openAuthModal } = useAuth();

  // Find attraction from props or fallback to direct fetch
  const initialAttraction = attractions.find(item => item.id === id || item._id?.toString() === id);
  const [attraction, setAttraction] = useState(initialAttraction || null);
  const [relatedPlaces, setRelatedPlaces] = useState([]);

  // Active cover image index for top hero
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // YouTube videos state
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('All');

  // Ratings & Recommendation state
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    distributionPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recommendationCount: 0,
    recommendationPercentage: 0,
    isRecommendedBadge: false
  });
  const [hasRecommended, setHasRecommended] = useState(false);
  const [recommending, setRecommending] = useState(false);

  // Category Feedback state
  const [feedbackData, setFeedbackData] = useState({
    totalResponses: 0,
    averages: { cleanliness: 0, safety: 0, accessibility: 0, facilities: 0, parking: 0, familyFriendly: 0, overall: 0 },
    recentComments: [],
    userFeedback: null
  });
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewSort, setReviewSort] = useState('newest');

  // Review Form state
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formReviewText, setFormReviewText] = useState('');
  const [formVisitDate, setFormVisitDate] = useState('');
  const [formRecStatus, setFormRecStatus] = useState('Recommended');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState({ type: '', message: '' });

  // Admin add image / video modals state
  const [adminAddImageOpen, setAdminAddImageOpen] = useState(false);
  const [adminImageUrl, setAdminImageUrl] = useState('');
  const [adminImageCaption, setAdminImageCaption] = useState('');
  const [adminAddVideoOpen, setAdminAddVideoOpen] = useState(false);
  const [adminVideoUrl, setAdminVideoUrl] = useState('');
  const [adminVideoTitle, setAdminVideoTitle] = useState('');
  const [adminVideoCategory, setAdminVideoCategory] = useState('Travel Vlog');
  const [adminVideoChannel, setAdminVideoChannel] = useState('');

  const targetId = attraction?._id || attraction?.id || id;

  // ── Load Attraction Details, Ratings, Reviews, Feedback, Photos, Videos ──
  const loadPlaceData = async () => {
    try {
      // 1. Fetch attraction details & related
      const resAttraction = await fetch(`/api/attractions/${targetId}`);
      const dataAttraction = await resAttraction.json();
      if (dataAttraction.success && dataAttraction.data) {
        setAttraction(dataAttraction.data);
        if (dataAttraction.related) setRelatedPlaces(dataAttraction.related);
      }

      // 2. Fetch ratings stats
      const resRatings = await fetch(`/api/places/${targetId}/ratings`);
      const dataRatings = await resRatings.json();
      if (dataRatings.success && dataRatings.data) {
        setRatingStats(dataRatings.data);
      }

      // 3. Fetch recommendations
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resRec = await fetch(`/api/places/${targetId}/recommendations`, { headers });
      const dataRec = await resRec.json();
      if (dataRec.success && dataRec.data) {
        setHasRecommended(dataRec.data.hasRecommended);
      }

      // 4. Fetch reviews
      const resReviews = await fetch(`/api/places/${targetId}/reviews?sort=${reviewSort}`, { headers });
      const dataReviews = await resReviews.json();
      if (dataReviews.success) {
        setReviews(dataReviews.data || []);
        if (dataReviews.userReview) {
          setUserReview(dataReviews.userReview);
          // Pre-populate form with existing review
          setFormRating(dataReviews.userReview.rating || 5);
          setFormTitle(dataReviews.userReview.title || '');
          setFormReviewText(dataReviews.userReview.reviewText || '');
          setFormVisitDate(dataReviews.userReview.visitDate || '');
          setFormRecStatus(dataReviews.userReview.recommendationStatus || 'Recommended');
        } else {
          setUserReview(null);
        }
      }

      // 5. Fetch feedback
      const resFeedback = await fetch(`/api/places/${targetId}/feedback`, { headers });
      const dataFeedback = await resFeedback.json();
      if (dataFeedback.success && dataFeedback.data) {
        setFeedbackData(dataFeedback.data);
      }

      // 6. Fetch images
      const resImages = await fetch(`/api/places/${targetId}/images`);
      const dataImages = await resImages.json();
      if (dataImages.success && dataImages.data) {
        setGalleryImages(dataImages.data);
      }

      // 7. Fetch videos
      const resVideos = await fetch(`/api/places/${targetId}/videos`);
      const dataVideos = await resVideos.json();
      if (dataVideos.success && dataVideos.data) {
        setVideos(dataVideos.data);
      }
    } catch (err) {
      console.error('Failed to load place details:', err);
    }
  };

  useEffect(() => {
    loadPlaceData();
  }, [targetId, token, reviewSort]);

  if (!attraction) {
    return (
      <div className="page-container" style={{ paddingTop: 80, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Attraction Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          The requested place details could not be loaded.
        </p>
        <Link to="/explore" className="btn-primary" style={{ display: 'inline-flex' }}>
          Return to Explore
        </Link>
      </div>
    );
  }

  const isInPlan = planIds.includes(attraction.id || attraction._id);
  const cleanImages = (attraction.images || []).filter(img => typeof img === 'string' && img.trim().length > 0);
  const images = cleanImages.length > 0
    ? cleanImages
    : ['https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=1200&q=80'];

  // ── Toggle Recommendation ──
  const handleToggleRecommend = async () => {
    if (!user || !token) {
      openAuthModal('login');
      return;
    }

    setRecommending(true);
    try {
      const method = hasRecommended ? 'DELETE' : 'POST';
      const res = await fetch(`/api/places/${targetId}/recommendations`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHasRecommended(data.hasRecommended);
        // Refresh ratings & recommendations count
        const resRatings = await fetch(`/api/places/${targetId}/ratings`);
        const dataRatings = await resRatings.json();
        if (dataRatings.success) setRatingStats(dataRatings.data);
      }
    } catch (err) {
      console.error('Error toggling recommendation:', err);
    } finally {
      setRecommending(false);
    }
  };

  // ── Submit or Update Review ──
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewFeedback({ type: '', message: '' });

    if (!user || !token) {
      openAuthModal('login');
      return;
    }

    if (!formTitle.trim() || !formReviewText.trim()) {
      setReviewFeedback({ type: 'error', message: 'Please provide both a title and your visitor experience.' });
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = {
        rating: formRating,
        title: formTitle.trim(),
        reviewText: formReviewText.trim(),
        visitDate: formVisitDate.trim(),
        recommendationStatus: formRecStatus,
        imageUrls: formImageUrl ? [formImageUrl.trim()] : []
      };

      const res = await fetch(`/api/places/${targetId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviewFeedback({ type: 'success', message: data.message });
      setUserReview(data.data);

      // Refresh reviews & ratings
      loadPlaceData();
      setTimeout(() => setReviewFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setReviewFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Delete Review ──
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(reviews.filter(r => r._id !== reviewId));
        if (userReview?._id === reviewId) {
          setUserReview(null);
          setFormTitle('');
          setFormReviewText('');
        }
        loadPlaceData();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch {
      alert('Network error while deleting review');
    }
  };

  // ── Report Review ──
  const handleReportReview = async (reviewId) => {
    const reason = prompt('Please share why this review is inappropriate:');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      alert(data.message || 'Review reported to moderation.');
    } catch {
      alert('Failed to report review.');
    }
  };

  // ── Admin: Add Photograph ──
  const handleAdminAddImage = async (e) => {
    e.preventDefault();
    if (!adminImageUrl.trim()) return;
    try {
      const res = await fetch(`/api/places/${targetId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: adminImageUrl.trim(),
          caption: adminImageCaption.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminImageUrl('');
        setAdminImageCaption('');
        setAdminAddImageOpen(false);
        // Refresh images
        const imgRes = await fetch(`/api/places/${targetId}/images`);
        const imgData = await imgRes.json();
        if (imgData.success) setGalleryImages(imgData.data);
      } else {
        alert(data.error || 'Failed to add image');
      }
    } catch {
      alert('Error adding photograph');
    }
  };

  // ── Admin: Add YouTube Video ──
  const handleAdminAddVideo = async (e) => {
    e.preventDefault();
    if (!adminVideoUrl.trim() || !adminVideoTitle.trim()) return;
    try {
      const res = await fetch(`/api/places/${targetId}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          url: adminVideoUrl.trim(),
          title: adminVideoTitle.trim(),
          category: adminVideoCategory,
          channelName: adminVideoChannel.trim() || 'Travel Channel'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminVideoUrl('');
        setAdminVideoTitle('');
        setAdminAddVideoOpen(false);
        // Refresh videos
        const vidRes = await fetch(`/api/places/${targetId}/videos`);
        const vidData = await vidRes.json();
        if (vidData.success) setVideos(vidData.data);
      } else {
        alert(data.error || 'Failed to add video');
      }
    } catch {
      alert('Error adding video');
    }
  };

  // ── Admin: Set Cover Image ──
  const handleSetCoverPhoto = async (targetImageUrl) => {
    if (!isAdmin || !token || !targetImageUrl) return;
    try {
      const res = await fetch(`/api/places/${targetId}/cover-image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: targetImageUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`"${attraction.name}" cover image updated successfully!`);
        setActiveImageIndex(0);
        loadPlaceData();
      } else {
        alert(data.error || 'Failed to update cover image.');
      }
    } catch {
      alert('Network error updating cover photograph.');
    }
  };

  // Filter videos by category
  const filteredVideos = videoCategoryFilter === 'All'
    ? videos
    : videos.filter(v => v.category === videoCategoryFilter);

  // All photos for gallery lightbox
  const displayGallery = galleryImages.length > 0
    ? galleryImages
    : images.map((url, i) => ({ imageUrl: url, caption: `${attraction.name} view ${i + 1}`, altText: attraction.name }));

  return (
    <div className="page-container animate-fadeIn">
      {/* ── Breadcrumb Navigation ── */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={14} />
        <Link to="/explore" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Explore</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{attraction.name}</span>
      </nav>

      {/* ── Main Details Grid (Left content + Right overview sidebar) ── */}
      <div className="details-grid">

        {/* ── Left Column: Media, Description, Gallery, Videos, Reviews ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* 1. Hero Cover Image with Badges */}
          <div style={{
            borderRadius: 20, overflow: 'hidden', height: 420,
            position: 'relative', border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)', background: 'var(--bg-secondary)'
          }}>
            <img
              src={resolveImageUrl(images[activeImageIndex])}
              alt={attraction.name}
              onError={handleImageError}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(5,10,20,0.85) 0%, transparent 60%)'
            }} />

            {/* Top Badges */}
            <span style={{
              position: 'absolute', top: 16, left: 16,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(20,184,166,0.2)', color: 'var(--text-accent)',
              border: '1px solid var(--border-accent)', fontSize: '0.8125rem', fontWeight: 700,
              backdropFilter: 'blur(8px)'
            }}>
              {attraction.category}
            </span>

            <span style={{
              position: 'absolute', top: 16, right: 16,
              padding: '6px 14px', borderRadius: 999,
              background: 'rgba(5,10,20,0.8)', color: 'var(--text-primary)',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8125rem', fontWeight: 600,
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6
            }}>
              <MapPin size={14} style={{ color: 'var(--text-accent)' }} />
              {attraction.distanceKm} km from Panadura
            </span>

            {/* Bottom Info on Hero Image */}
            <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', fontWeight: 900,
                  color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8
                }}>
                  {attraction.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {/* Star Rating Badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 8,
                    background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)',
                    color: '#f59e0b', fontSize: '0.875rem', fontWeight: 800
                  }}>
                    <Star size={15} fill="#f59e0b" />
                    <span>{ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : 'New'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 500 }}>
                      ({ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>

                  {/* Recommendation Badge */}
                  {ratingStats.isRecommendedBadge && (
                    <span style={{
                      padding: '4px 12px', borderRadius: 8,
                      background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.4)',
                      color: '#34d399', fontSize: '0.8125rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(8px)'
                    }}>
                      <ThumbsUp size={13} />
                      Recommended by {ratingStats.recommendationPercentage}% of visitors
                    </span>
                  )}
                </div>
              </div>

              {/* Actions on Hero: View Gallery + Admin Cover Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {isAdmin && activeImageIndex !== 0 && (
                  <button
                    onClick={() => handleSetCoverPhoto(images[activeImageIndex])}
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: '0.8125rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#050a14', fontWeight: 800, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    title="Make this photograph the primary cover image for this destination"
                  >
                    <Star size={14} fill="#050a14" /> Set as Cover Image
                  </button>
                )}

                {activeImageIndex === 0 && (
                  <span style={{
                    padding: '7px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 800,
                    background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)',
                    color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(8px)'
                  }}>
                    <Star size={13} fill="#f59e0b" /> Primary Cover
                  </span>
                )}

                <button
                  onClick={() => {
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: '0.8125rem', backdropFilter: 'blur(8px)' }}
                >
                  <Camera size={14} style={{ color: 'var(--text-accent)' }} />
                  View Gallery ({displayGallery.length})
                </button>
              </div>
            </div>
          </div>

          {/* Hero Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    position: 'relative',
                    width: 80, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                    border: `2px solid ${activeImageIndex === idx ? (idx === 0 ? '#f59e0b' : 'var(--accent-teal)') : 'var(--border-subtle)'}`,
                    opacity: activeImageIndex === idx ? 1 : 0.6,
                    cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.2s'
                  }}
                  title={idx === 0 ? 'Current Cover Photo' : `Photo ${idx + 1}`}
                >
                  <img
                    src={resolveImageUrl(img)}
                    alt=""
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {idx === 0 && (
                    <span style={{
                      position: 'absolute', top: 3, left: 3,
                      background: '#f59e0b', color: '#000',
                      borderRadius: 4, padding: '1px 5px', fontSize: '9px', fontWeight: 900
                    }}>
                      Cover
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 2. Destination Description & Details */}
          <div className="glass-card" style={{ padding: '28px 30px', borderRadius: 20 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
              About This Destination
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {attraction.description}
            </p>
          </div>

          {/* 3. Photo Gallery Section */}
          <div className="glass-card" style={{ padding: '28px 30px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Camera size={20} style={{ color: 'var(--text-accent)' }} />
                  Photo Gallery &amp; Scenery
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Browse authentic photographs and scenic angles captured by visitors and administrators.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setAdminAddImageOpen(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px', borderRadius: 8 }}
                >
                  <PlusCircle size={14} style={{ color: 'var(--text-accent)' }} /> Add Photograph
                </button>
              )}
            </div>

            {/* Photo Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {displayGallery.map((img, idx) => {
                const url = typeof img === 'string' ? img : (img.imageUrl || img.url);
                const caption = img.caption || `${attraction.name} Photo ${idx + 1}`;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                    style={{
                      height: 140, borderRadius: 12, overflow: 'hidden',
                      position: 'relative', cursor: 'pointer', border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <img
                      src={resolveImageUrl(url)}
                      alt={caption}
                      loading="lazy"
                      onError={handleImageError}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                      opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'flex-end', padding: 8
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                      <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>{caption}</span>
                    </div>

                    {/* Cover Badge or Set as Cover Button */}
                    {url === images[0] ? (
                      <span style={{
                        position: 'absolute', top: 6, left: 6, zIndex: 2,
                        background: '#f59e0b', color: '#000',
                        borderRadius: 6, padding: '2px 8px', fontSize: '10px', fontWeight: 900
                      }}>
                        ★ Cover
                      </span>
                    ) : isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCoverPhoto(url);
                        }}
                        style={{
                          position: 'absolute', top: 6, left: 6, zIndex: 2,
                          background: '#f59e0b', color: '#000', border: 'none',
                          borderRadius: 6, padding: '3px 8px', fontSize: '10px', fontWeight: 900,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                        }}
                        title="Set this photo as the main attraction cover"
                      >
                        <Star size={11} fill="#000" /> Set Cover
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. YouTube Travel Videos & Reviews Section */}
          <div className="glass-card" style={{ padding: '28px 30px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tv size={20} style={{ color: '#ef4444' }} />
                  YouTube Travel Videos &amp; Walkthroughs
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Watch real travel vlogs, historical documentaries, and walkthroughs before your visit.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setAdminAddVideoOpen(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px', borderRadius: 8 }}
                >
                  <PlusCircle size={14} style={{ color: '#ef4444' }} /> Add Video
                </button>
              )}
            </div>

            {/* Video Category Filters */}
            {videos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                {['All', 'Travel Vlog', 'Walking Tour', 'Historical Info', 'Tourist Review', 'Things to Do'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setVideoCategoryFilter(cat)}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                      background: videoCategoryFilter === cat ? 'rgba(239,68,68,0.18)' : 'var(--bg-hover)',
                      border: videoCategoryFilter === cat ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border-subtle)',
                      color: videoCategoryFilter === cat ? '#f87171' : 'var(--text-secondary)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Videos Grid */}
            {filteredVideos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
                <Tv size={32} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                <p style={{ fontSize: '0.875rem' }}>No travel videos available in this category yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filteredVideos.map(video => (
                  <div
                    key={video._id}
                    onClick={() => {
                      setSelectedVideo(video);
                      setVideoModalOpen(true);
                    }}
                    style={{
                      borderRadius: 14, overflow: 'hidden',
                      background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                      cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s'
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
                    {/* Thumbnail with Play Icon */}
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
                          width: 48, height: 48, borderRadius: '50%',
                          background: 'rgba(239,68,68,0.9)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
                        }}>
                          <Play size={20} fill="#fff" style={{ marginLeft: 3 }} />
                        </div>
                      </div>
                      <span style={{
                        position: 'absolute', bottom: 8, right: 8,
                        padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(0,0,0,0.8)', color: '#fff',
                        fontSize: '0.6875rem', fontWeight: 600
                      }}>
                        YouTube
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(239,68,68,0.12)', color: '#f87171',
                        fontSize: '0.6875rem', fontWeight: 700, display: 'inline-block', marginBottom: 6
                      }}>
                        {video.category}
                      </span>
                      <h3 style={{
                        fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        lineHeight: 1.35, marginBottom: 4
                      }}>
                        {video.title}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {video.channelName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Visitor Ratings & Category Feedback Summary */}
          <div className="glass-card" style={{ padding: '28px 30px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={20} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  Ratings &amp; Experience Overview
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Aggregated from {ratingStats.totalRatings} authentic visitor experiences.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!user) openAuthModal('login');
                  else setFeedbackModalOpen(true);
                }}
                className="btn-primary"
                style={{ fontSize: '0.8125rem', padding: '9px 16px', borderRadius: 10 }}
              >
                Rate Facilities
              </button>
            </div>

            {/* Score & Distribution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 2fr', gap: 24, alignItems: 'center', marginBottom: 28 }}>
              {/* Big Score Box */}
              <div style={{
                textAlign: 'center', padding: '24px 20px', borderRadius: 16,
                background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                  {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : '5.0'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '10px 0' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      fill={star <= Math.round(ratingStats.averageRating || 5) ? '#f59e0b' : 'transparent'}
                      style={{ color: '#f59e0b' }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Based on {ratingStats.totalRatings} visitor ratings
                </span>
              </div>

              {/* Star Distribution Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[5, 4, 3, 2, 1].map(stars => {
                  const pct = ratingStats.distributionPercentages[stars] || 0;
                  const count = ratingStats.distribution[stars] || 0;
                  return (
                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.75rem' }}>
                      <span style={{ width: 44, color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {stars} <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                      </span>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                          borderRadius: 4, transition: 'width 0.5s ease'
                        }} />
                      </div>
                      <span style={{ width: 60, textAlign: 'right', color: 'var(--text-muted)' }}>
                        {pct}% ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category-Based Feedback Breakdown */}
            <div style={{ paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
                Facility &amp; Comfort Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Cleanliness', score: feedbackData.averages.cleanliness || 4.5, icon: Sparkles, color: '#10b981' },
                  { label: 'Safety & Security', score: feedbackData.averages.safety || 4.7, icon: Shield, color: '#06b6d4' },
                  { label: 'Accessibility', score: feedbackData.averages.accessibility || 4.4, icon: Accessibility, color: '#3b82f6' },
                  { label: 'Facilities', score: feedbackData.averages.facilities || 4.3, icon: Building, color: '#8b5cf6' },
                  { label: 'Parking Space', score: feedbackData.averages.parking || 4.2, icon: Car, color: '#f59e0b' },
                  { label: 'Family-Friendly', score: feedbackData.averages.familyFriendly || 4.8, icon: Users, color: '#ec4899' },
                ].map(({ label, score, icon: Icon, color }) => (
                  <div key={label} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        <Icon size={14} style={{ color }} /> {label}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color }}>
                        {score.toFixed(1)} / 5
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. User Reviews List */}
          <div className="glass-card" style={{ padding: '28px 30px', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={20} style={{ color: 'var(--text-accent)' }} />
                  Visitor Reviews ({reviews.length})
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Read real visitor impressions, advice, and tips.
                </p>
              </div>

              {/* Sort selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort by:</span>
                <select
                  value={reviewSort}
                  onChange={e => setReviewSort(e.target.value)}
                  className="tb-input"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8 }}
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>No reviews yet for this destination. Be the first to share your experience!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {reviews.map(review => {
                  const isAuthor = user && (user.id === review.userId || user._id === review.userId);
                  const canManage = isAuthor || isAdmin;
                  return (
                    <div
                      key={review._id}
                      style={{
                        padding: '20px 22px', borderRadius: 16,
                        background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      {/* Top row: Avatar, Name, Rating, Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Link to={`/users/${review.userId}`} style={{ textDecoration: 'none' }}>
                            <img
                              src={review.userProfilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(review.userName)}`}
                              alt={review.userName}
                              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-accent)' }}
                            />
                          </Link>
                          <div>
                            <Link
                              to={`/users/${review.userId}`}
                              style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', textDecoration: 'none' }}
                            >
                              {review.userName}
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              <span>{review.visitDate ? `Visited: ${review.visitDate}` : new Date(review.createdAt).toLocaleDateString()}</span>
                              {review.recommendationStatus === 'Recommended' && (
                                <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                  • <ThumbsUp size={11} /> Recommends
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stars & Author actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Star size={13} fill="#f59e0b" />
                            <span>{review.rating}.0</span>
                          </div>

                          {canManage && (
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                              title="Delete review"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => handleReportReview(review._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                            title="Report review"
                          >
                            <Flag size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Review Title & Experience Text */}
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                        {review.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                        {review.reviewText}
                      </p>

                      {/* Review Photos */}
                      {review.images && review.images.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
                          {review.images.map((img, i) => (
                            <div
                              key={i}
                              style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: '1px solid var(--border-subtle)' }}
                              onClick={() => {
                                setLightboxIndex(0);
                                setLightboxOpen(true);
                              }}
                            >
                              <img
                                src={resolveImageUrl(img.url || img)}
                                alt=""
                                onError={handleImageError}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 7. Review Submission Form */}
          <div id="review-form" className="glass-card" style={{ padding: '28px 30px', borderRadius: 20 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              {userReview ? 'Update Your Review' : 'Share Your Visitor Experience'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              {userReview
                ? 'You already submitted a review for this place. You can update your thoughts below.'
                : 'Help others discover hidden gems by posting your authentic review and advice.'}
            </p>

            {reviewFeedback.message && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px', borderRadius: 12, marginBottom: 18,
                background: reviewFeedback.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                border: reviewFeedback.type === 'error' ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(16,185,129,0.25)',
                color: reviewFeedback.type === 'error' ? '#fca5a5' : '#6ee7b7',
                fontSize: '0.8125rem'
              }}>
                {reviewFeedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <span>{reviewFeedback.message}</span>
              </div>
            )}

            {!user ? (
              <div style={{
                padding: '24px 20px', borderRadius: 14,
                background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}>
                <Shield size={28} style={{ color: 'var(--text-accent)', margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Sign In Required to Submit Reviews
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Only registered visitors can post reviews, ratings, and recommendations.
                </p>
                <button onClick={() => openAuthModal('login')} className="btn-primary" style={{ padding: '10px 22px' }}>
                  Sign In / Create Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Interactive Star Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Overall Rating (1 to 5 Stars) *
                  </label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(star => {
                      const active = star <= (formHoverRating || formRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFormHoverRating(star)}
                          onMouseLeave={() => setFormHoverRating(0)}
                          onClick={() => setFormRating(star)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: 4, display: 'flex', alignItems: 'center', transition: 'transform 0.1s'
                          }}
                        >
                          <Star
                            size={28}
                            fill={active ? '#f59e0b' : 'transparent'}
                            style={{ color: active ? '#f59e0b' : 'var(--text-muted)' }}
                          />
                        </button>
                      );
                    })}
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f59e0b', marginLeft: 8 }}>
                      {formRating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Review Headline / Summary *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Magnificent coastal sunset and peaceful environment"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="tb-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                {/* Review Experience Text */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Your Experience &amp; Advice *
                  </label>
                  <textarea
                    placeholder="What did you enjoy most? How was the crowd, parking, or best time to visit?"
                    value={formReviewText}
                    onChange={e => setFormReviewText(e.target.value)}
                    className="tb-input"
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                    required
                  />
                </div>

                {/* Date & Recommendation Radio */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Date of Visit (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. October 2026"
                      value={formVisitDate}
                      onChange={e => setFormVisitDate(e.target.value)}
                      className="tb-input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Would you recommend this place?
                    </label>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        <input
                          type="radio"
                          name="recStatus"
                          value="Recommended"
                          checked={formRecStatus === 'Recommended'}
                          onChange={() => setFormRecStatus('Recommended')}
                        />
                        <ThumbsUp size={14} style={{ color: '#10b981' }} /> Yes, Recommended
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <input
                          type="radio"
                          name="recStatus"
                          value="Not Recommended"
                          checked={formRecStatus === 'Not Recommended'}
                          onChange={() => setFormRecStatus('Not Recommended')}
                        />
                        Not Recommended
                      </label>
                    </div>
                  </div>
                </div>

                {/* Optional Photograph URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    className="tb-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary"
                    style={{ padding: '12px 28px', borderRadius: 10, fontSize: '0.9rem' }}
                  >
                    {submittingReview ? 'Submitting Review...' : (userReview ? 'Update My Review' : 'Submit Review')}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 8. Related Attractions */}
          {relatedPlaces.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
                You May Also Want to Visit
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {relatedPlaces.map(rel => (
                  <Link
                    key={rel._id}
                    to={`/attractions/${rel._id}`}
                    className="glass-card"
                    style={{ borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ height: 130, position: 'relative' }}>
                      <img
                        src={resolveImageUrl(rel.images?.[0])}
                        alt={rel.name}
                        onError={handleImageError}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute', top: 8, left: 8,
                        padding: '2px 8px', borderRadius: 999,
                        background: 'rgba(5,10,20,0.8)', color: 'var(--text-accent)',
                        fontSize: '0.6875rem', fontWeight: 700
                      }}>
                        {rel.category}
                      </span>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {rel.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {rel.distanceKm} km from Panadura
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Sticky Visitor Overview Sidebar ── */}
        <div style={{ position: 'sticky', top: 24, height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: '24px 24px', borderRadius: 20 }}>
            <h3 style={{
              fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)',
              paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border-subtle)'
            }}>
              Visitor Overview
            </h3>

            {/* Quick stats items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {[
                { icon: Clock,      label: 'Opening Hours',       value: attraction.openingHours || 'Open Daily', color: 'var(--text-accent)' },
                { icon: DollarSign, label: 'Entrance Fee',        value: attraction.entranceFee || 'Free',        color: '#10b981' },
                { icon: Clock,      label: 'Est. Visit Time',     value: `${attraction.visitDurationMinutes || 60} Minutes`, color: '#22d3ee' },
                { icon: MapPin,     label: 'Distance (Panadura)', value: `${attraction.distanceKm} km`,           color: '#f59e0b' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Icon size={14} style={{ color }} /> {label}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '55%' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Facilities & Parking Info in Sidebar */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                <CheckCircle2 size={14} style={{ color: '#10b981' }} /> Facilities
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {attraction.facilities?.map((f, i) => (
                  <span key={i} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--bg-hover)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {f}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                <Car size={14} style={{ color: 'var(--text-accent)' }} /> Parking &amp; Access
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {attraction.parkingInfo || 'Parking available nearby.'}
              </p>
            </div>

            {/* Travel Tips if available */}
            {attraction.travelTips && (
              <div style={{
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
                  <Lightbulb size={14} /> Visitor Tip
                </div>
                <p style={{ fontSize: '0.75rem', color: '#fcd34d', lineHeight: 1.5, opacity: 0.9 }}>
                  {attraction.travelTips}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              {/* Day Plan Toggle Button */}
              <button
                onClick={() => onTogglePlan(attraction)}
                className={isInPlan ? '' : 'btn-primary'}
                style={{
                  width: '100%', padding: '13px 16px',
                  borderRadius: 12, fontWeight: 700, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', transition: 'all 0.2s',
                  ...(isInPlan
                    ? {
                        background: 'rgba(16,185,129,0.12)',
                        color: '#34d399', border: '1px solid rgba(16,185,129,0.3)',
                      }
                    : { border: 'none' }
                  ),
                }}
              >
                {isInPlan
                  ? <><Check size={16} /> Added to Day Plan</>
                  : <><Plus size={16} /> Add to One-Day Plan</>
                }
              </button>

              {/* Recommendation Toggle Button */}
              <button
                onClick={handleToggleRecommend}
                disabled={recommending}
                className="btn-secondary"
                style={{
                  width: '100%', justifyContent: 'center', borderRadius: 12, padding: '11px 16px',
                  ...(hasRecommended ? {
                    background: 'rgba(16,185,129,0.15)',
                    borderColor: 'rgba(16,185,129,0.4)',
                    color: '#34d399'
                  } : {})
                }}
              >
                <ThumbsUp size={15} style={{ color: hasRecommended ? '#34d399' : 'var(--text-accent)' }} />
                {hasRecommended ? 'Recommended by You' : 'Recommend Destination'}
              </button>

              {/* Write Review Link */}
              <a
                href="#review-form"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '11px 16px' }}
              >
                <MessageSquare size={15} style={{ color: 'var(--text-accent)' }} />
                Write a Review
              </a>

              {/* Map Link */}
              <Link
                to={`/map?focus=${attraction.id || attraction._id}`}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '11px 16px' }}
              >
                <MapPin size={15} style={{ color: 'var(--text-accent)' }} />
                View on Map
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox Gallery Modal ── */}
      <LightboxModal
        images={displayGallery}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={idx => setLightboxIndex(idx)}
      />

      {/* ── YouTube Video Player Modal ── */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setSelectedVideo(null);
        }}
      />

      {/* ── Category Feedback Modal ── */}
      <FeedbackModal
        placeId={targetId}
        placeName={attraction.name}
        existingFeedback={feedbackData.userFeedback}
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onFeedbackSaved={saved => {
          loadPlaceData();
        }}
      />

      {/* ── Admin Add Image Modal ── */}
      {adminAddImageOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            backgroundColor: 'rgba(5,10,20,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
          onClick={() => setAdminAddImageOpen(false)}
        >
          <div
            className="glass-card animate-fadeIn"
            style={{ width: '100%', maxWidth: 440, padding: 24, borderRadius: 16 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              Add Destination Photograph
            </h3>
            <form onSubmit={handleAdminAddImage} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Image URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={adminImageUrl}
                  onChange={e => setAdminImageUrl(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', marginTop: 4 }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Caption (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sunset view from beach pavilion"
                  value={adminImageCaption}
                  onChange={e => setAdminImageCaption(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setAdminAddImageOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Admin Add YouTube Video Modal ── */}
      {adminAddVideoOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            backgroundColor: 'rgba(5,10,20,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
          onClick={() => setAdminAddVideoOpen(false)}
        >
          <div
            className="glass-card animate-fadeIn"
            style={{ width: '100%', maxWidth: 460, padding: 24, borderRadius: 16 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              Add YouTube Travel Video
            </h3>
            <form onSubmit={handleAdminAddVideo} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>YouTube Video URL or ID *</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or Video ID"
                  value={adminVideoUrl}
                  onChange={e => setAdminVideoUrl(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', marginTop: 4 }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Video Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Panadura Beach Coastal Walking Tour"
                  value={adminVideoTitle}
                  onChange={e => setAdminVideoTitle(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', marginTop: 4 }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                <select
                  value={adminVideoCategory}
                  onChange={e => setAdminVideoCategory(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', marginTop: 4 }}
                >
                  <option value="Travel Vlog">Travel Vlog</option>
                  <option value="Tourist Review">Tourist Review</option>
                  <option value="Historical Info">Historical Info</option>
                  <option value="Walking Tour">Walking Tour</option>
                  <option value="Travel Guide">Travel Guide</option>
                  <option value="Things to Do">Things to Do</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Island Explorer"
                  value={adminVideoChannel}
                  onChange={e => setAdminVideoChannel(e.target.value)}
                  className="tb-input"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setAdminAddVideoOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Video</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
