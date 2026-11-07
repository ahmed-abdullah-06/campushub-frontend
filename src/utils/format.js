// Compact relative timestamps ("3 min ago", "2 days ago") for the activity
// feeds. Falls back to the raw string when the value can't be parsed.
export const timeAgo = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /ago/i.test(value)) return value; // already formatted

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return 'Just now';
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} min ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(seconds / 86400);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

// "2026-09-15" -> "Sep 15, 2026" (keeps "Just now"-style strings intact)
export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatTime12 = (value) => {
  if (!value) return '';
  if (!/^\d{2}:\d{2}$/.test(String(value))) return String(value); // already "09:00 AM"
  const [h, m] = String(value).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};
