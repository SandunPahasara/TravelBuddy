/**
 * Utility helper to safely extract and validate YouTube Video IDs.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - Raw 11-character video ID
 */

function extractYouTubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // If already an 11-char YouTube ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex for full URLs
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

function getYouTubeEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

function getYouTubeThumbnail(videoId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

module.exports = {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail
};
