/** A router path that cannot leave this site through a protocol or backslash trick. */
export function internalPath(value, fallback = '/') {
  if (typeof value !== 'string') return fallback;
  const path = value.trim();
  if (!path.startsWith('/') || path.startsWith('//')) return fallback;
  if (/[\\:\s]/.test(path)) return fallback;
  return path;
}

export function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

/** One URL path segment: letters, numbers, underscore, or hyphen. */
export function pathSegment(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value);
  if (!/^[A-Za-z0-9_-]+$/.test(text)) return null;
  return text;
}
