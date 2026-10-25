/**
 * Helper utility for robust image loading across environments
 */

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

/**
 * Resolves an image URL safely:
 * - If relative (/uploads/...), checks environment or preserves relative
 * - If external URL, preserves it
 */
export function resolveImageUrl(url, fallback = DEFAULT_FALLBACK) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const clean = url.trim();

  // If already absolute or data uri
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  // Ensure leading slash for uploaded assets
  if (clean.startsWith('uploads/')) {
    return `/${clean}`;
  }

  return clean;
}

/**
 * Handles image loading errors gracefully.
 * If a relative /uploads request fails (e.g. Vite proxy not yet reloaded),
 * automatically retries by requesting directly from the backend on port 5000.
 * If that fails too, falls back to a high-quality landscape placeholder.
 */
export function handleImageError(e, fallback = DEFAULT_FALLBACK) {
  const currentSrc = e.currentTarget.src || '';

  // Step 1: If relative /uploads request failed, try direct port 5000 backend
  if (currentSrc.includes('/uploads/') && !currentSrc.includes(':5000')) {
    const uploadPath = currentSrc.substring(currentSrc.indexOf('/uploads/'));
    e.currentTarget.src = `http://localhost:5000${uploadPath}`;
    return;
  }

  // Step 2: Prevent infinite onError loop if fallback also fails
  if (e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
}
