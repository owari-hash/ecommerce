/**
 * Convert any backend upload URL to a relative /upload/... path so the
 * Next.js rewrite proxy serves it over HTTPS, preventing mixed-content errors.
 */
export function resolveUploadUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  // Already relative
  if (url.startsWith('/upload/')) return url;
  // Extract the /upload/... suffix from an absolute URL
  const match = url.match(/\/upload\/(.+)$/);
  if (match) return `/upload/${match[1]}`;
  // External CDN / Unsplash etc — keep as-is
  if (url.startsWith('https://')) return url;
  // http:// backend URL without /upload/ path — just keep it (will still fail, but at least explicit)
  return url;
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
