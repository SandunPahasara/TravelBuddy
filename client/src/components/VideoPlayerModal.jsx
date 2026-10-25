import React, { useEffect } from 'react';
import { X, ExternalLink, Play, Tv } from 'lucide-react';

export default function VideoPlayerModal({ video, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?autoplay=1&rel=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeVideoId}`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        backgroundColor: 'rgba(4, 8, 16, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fadeIn"
        style={{
          width: '100%', maxWidth: 840,
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(239,68,68,0.15)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5
            }}>
              <Tv size={12} /> {video.category || 'Travel Vlog'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {video.channelName || 'YouTube Travel'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
            }}
            aria-label="Close video player"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Iframe Container (16:9) */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', border: 'none'
            }}
          />
        </div>

        {/* Video Details & Footer */}
        <div style={{ padding: '18px 22px', background: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            {video.title}
          </h2>

          {video.description && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
              {video.description}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 14px', borderRadius: 8 }}
            >
              <ExternalLink size={14} /> Watch directly on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
