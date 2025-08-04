export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export function apiUrl(path: string) {
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_BASE}${path}`;
}
