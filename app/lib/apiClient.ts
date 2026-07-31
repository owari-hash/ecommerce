/**
 * Convert any backend upload URL to a relative /upload/... path so the
 * Next.js rewrite proxy serves it over HTTPS, preventing mixed-content errors.
 */
export function resolveUploadUrl(url: string | undefined | null): string {
  if (!url) return '';
  const clean = String(url).trim();
  if (!clean) return '';
  if (clean.startsWith('data:') || clean.startsWith('blob:')) return clean;

  // Match /upload/... or /uploads/... or upload/... or uploads/...
  const match = clean.match(/(?:^|\/)uploads?\/(.+)$/i);
  if (match) {
    return `/upload/${match[1]}`;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const httpMatch = clean.match(/\/uploads?\/(.+)$/i);
    if (httpMatch) return `/upload/${httpMatch[1]}`;
    return clean;
  }

  // If it has an image file extension (e.g. image.png, /image.jpg)
  if (/\.(png|jpe?g|webp|svg|gif|avif)$/i.test(clean)) {
    const basename = clean.replace(/^\/+/, '');
    if (basename.toLowerCase().startsWith('upload/') || basename.toLowerCase().startsWith('uploads/')) {
      return `/${basename.replace(/^uploads?\//i, 'upload/')}`;
    }
    return `/upload/${basename}`;
  }

  if (clean.startsWith('/')) return clean;
  return clean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getBaseUrl() {
  return typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000')
}

function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path}`
  const token = getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...init, headers })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({ error: res.statusText }))

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? 'Request failed', data?.details)
  }

  return data
}

export function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { method: 'GET', ...init })
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}
