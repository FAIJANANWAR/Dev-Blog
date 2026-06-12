/**
 * Estimates reading time of a text block based on average reading speed (200 words/min).
 */
export function estimateReadingTime(content: string | undefined): number {
  if (!content) return 0;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes > 0 ? minutes : 1;
}

/**
 * Formats an ISO date string into a friendly localized format: e.g., "June 12, 2026".
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
