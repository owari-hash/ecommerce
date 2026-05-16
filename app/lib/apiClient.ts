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
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
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
