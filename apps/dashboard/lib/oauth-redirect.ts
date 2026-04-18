/**
 * Validates OAuth redirect URLs to prevent open redirect attacks.
 * Only allows relative paths (e.g. /dashboard, /dashboard/projects).
 * Rejects protocol-relative (//evil.com), absolute URLs, and paths with backslashes.
 */
const DEFAULT_SAFE_REDIRECT = '/dashboard';

export function validateOAuthRedirect(redirect: string | null | undefined): string {
  if (!redirect || typeof redirect !== 'string') {
    return DEFAULT_SAFE_REDIRECT;
  }
  const trimmed = redirect.trim();
  // Must start with / but not // (protocol-relative)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return DEFAULT_SAFE_REDIRECT;
  }
  // Reject backslashes (can be used for bypasses)
  if (trimmed.includes('\\')) {
    return DEFAULT_SAFE_REDIRECT;
  }
  // Reject any URL-like patterns (e.g. /\\evil.com)
  if (/^\/\\/.test(trimmed)) {
    return DEFAULT_SAFE_REDIRECT;
  }
  return trimmed || DEFAULT_SAFE_REDIRECT;
}
