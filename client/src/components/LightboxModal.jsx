import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl, handleImageError } from '../utils/imageUrl';

export default function LightboxModal({ images, currentIndex, isOpen, onClose, onIndexChange }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images?.length > 1) {
        onIndexChange((currentIndex + 1) % images.length);
      }
      if (e.key === 'ArrowLeft' && images?.length > 1) {
        onIndexChange((currentIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex, images, onClose, onIndexChange]);

  if (!isOpen || !images || images.length === 0) return null;

  const current = images[currentIndex] || images[0];
  const currentUrl = typeof current === 'string' ? current : (current.url || current.imageUrl);
  const caption = current?.caption || '';
  const altText = current?.altText || 'Destination photo';

  const handlePrev = (e) => {
    e.stopPropagation();
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    onIndexChange((currentIndex + 1) % images.length);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        backgroundColor: 'rgba(3, 7, 18, 0.94)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px'
      }}
      onClick={onClose}
    >
      {/* Top Header */}
      <div
        style={{
          position: 'absolute', top: 20, left: 24, right: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: '#fff', zIndex: 10
        }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 999,
            padding: 8, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
          aria-label="Close fullscreen gallery"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Image Frame */}
      <div
        style={{
          position: 'relative', maxWidth: '90vw', maxHeight: '72vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={e => e.stopPropagation()}
      >
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute', left: -50, top: '50%', transform: 'translateY(-50%)',
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 5
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <img
          src={resolveImageUrl(currentUrl)}
          alt={altText}
          loading="lazy"
          onError={handleImageError}
          style={{
            maxWidth: '100%', maxHeight: '72vh',
            objectFit: 'contain', borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}
        />

        {images.length > 1 && (
          <button
            onClick={handleNext}
            style={{
              position: 'absolute', right: -50, top: '50%', transform: 'translateY(-50%)',
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 5
            }}
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Caption Bar */}
      {caption && (
        <div
          style={{
            marginTop: 14, textAlign: 'center', maxWidth: 700,
            color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500
          }}
          onClick={e => e.stopPropagation()}
        >
          {caption}
        </div>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex', gap: 10, marginTop: 16,
            overflowX: 'auto', maxWidth: '80vw', padding: '6px 4px'
          }}
          onClick={e => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const url = typeof img === 'string' ? img : (img.url || img.imageUrl);
            const active = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                style={{
                  width: 58, height: 44, borderRadius: 8, overflow: 'hidden',
                  border: active ? '2px solid var(--accent-teal)' : '1px solid rgba(255,255,255,0.2)',
                  opacity: active ? 1 : 0.5, cursor: 'pointer', padding: 0,
                  flexShrink: 0, transition: 'all 0.2s', background: 'none'
                }}
              >
                <img
                  src={resolveImageUrl(url)}
                  alt=""
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
