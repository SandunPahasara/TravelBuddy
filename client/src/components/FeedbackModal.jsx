import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Shield, Accessibility, Building,
  Car, Users, MessageSquare, CheckCircle2, AlertCircle, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { key: 'cleanliness',    label: 'Cleanliness',           icon: Sparkles,      description: 'Litter management, fresh air & cleanliness of surroundings' },
  { key: 'safety',         label: 'Safety & Security',     icon: Shield,        description: 'Lighting, crowd control, safe pathways & visible security' },
  { key: 'accessibility',  label: 'Accessibility',         icon: Accessibility, description: 'Ease of access for elderly, wheelchairs & public transit' },
  { key: 'facilities',     label: 'Facilities & Restrooms',icon: Building,      description: 'Availability of restrooms, shaded seating & drinking water' },
  { key: 'parking',        label: 'Parking Availability',  icon: Car,           description: 'Space for vehicles, motorcycles & ease of entry' },
  { key: 'familyFriendly', label: 'Family Friendliness',   icon: Users,         description: 'Suitable for children, seniors & family groups' },
];

export default function FeedbackModal({ placeId, placeName, existingFeedback, isOpen, onClose, onFeedbackSaved }) {
  const { user, token, openAuthModal } = useAuth();
  const [ratings, setRatings] = useState({
    cleanliness: 4,
    safety: 4,
    accessibility: 4,
    facilities: 4,
    parking: 4,
    familyFriendly: 4
  });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (existingFeedback) {
      setRatings({
        cleanliness: existingFeedback.cleanliness || 4,
        safety: existingFeedback.safety || 4,
        accessibility: existingFeedback.accessibility || 4,
        facilities: existingFeedback.facilities || 4,
        parking: existingFeedback.parking || 4,
        familyFriendly: existingFeedback.familyFriendly || 4
      });
      setComments(existingFeedback.comments || '');
    }
  }, [existingFeedback, isOpen]);

  if (!isOpen) return null;

  const handleRatingChange = (key, val) => {
    setRatings(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user || !token) {
      openAuthModal('login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/places/${placeId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...ratings,
          comments: comments.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccessMsg('Your experience feedback has been saved! Thank you.');
      if (onFeedbackSaved) onFeedbackSaved(data.data);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fadeIn"
        style={{
          width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 24px', position: 'relative',
          borderRadius: 20, border: '1px solid var(--border-accent)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 18, right: 18,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
          aria-label="Close feedback modal"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(20,184,166,0.12)', border: '1px solid var(--border-accent)',
            color: 'var(--text-accent)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8
          }}>
            Destination Experience Survey
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Visitor Feedback for {placeName}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Rate destination facilities to help fellow travelers make informed day-visit plans.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: '0.8125rem'
          }}>
            <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#6ee7b7', fontSize: '0.8125rem'
          }}>
            <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Categories Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CATEGORIES.map(({ key, label, icon: Icon, description }) => {
              const currentScore = ratings[key];
              return (
                <div
                  key={key}
                  style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Icon size={15} style={{ color: 'var(--text-accent)' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {description}
                    </p>
                  </div>

                  {/* 1 to 5 Star Rating Buttons */}
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(key, star)}
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: star <= currentScore ? '1px solid #14b8a6' : '1px solid var(--border-subtle)',
                          background: star <= currentScore ? 'rgba(20,184,166,0.2)' : 'rgba(0,0,0,0.2)',
                          color: star <= currentScore ? '#2dd4bf' : 'var(--text-muted)',
                          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        title={`${star} out of 5`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Visitor Experience Comments */}
          <div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6
            }}>
              <MessageSquare size={14} style={{ color: 'var(--text-accent)' }} />
              Helpful Visitor Observations &amp; Advice (Optional)
            </label>
            <textarea
              placeholder="e.g. Best to park near the northern gate; restrooms are clean near the ticket desk..."
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="tb-input"
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ borderRadius: 10, padding: '10px 18px', fontSize: '0.875rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ borderRadius: 10, padding: '10px 22px', fontSize: '0.875rem' }}
            >
              {loading ? 'Saving Feedback...' : 'Submit Experience Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
