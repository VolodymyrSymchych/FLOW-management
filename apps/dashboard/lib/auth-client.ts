// Client-side auth utilities

export function getToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  // Get token from cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'session') {
      return value;
    }
  }
  
  return null;
}

export function setToken(token: string) {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = `session=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
}

export function removeToken() {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = 'session=; path=/; max-age=0';
}

