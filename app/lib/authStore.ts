'use client'

export type User = {
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
}

// In-memory auth state (set after API login, cleared on logout)
let _currentUser: User | null = null
let _accessToken: string | null = null
let _refreshToken: string | null = null

function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return _accessToken || localStorage.getItem('access_token') || null
}

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return _refreshToken || localStorage.getItem('refresh_token') || null
}

function saveTokens(accessToken?: string, refreshToken?: string) {
  if (accessToken) {
    _accessToken = accessToken
    if (typeof window !== 'undefined') localStorage.setItem('access_token', accessToken)
  }
  if (refreshToken) {
    _refreshToken = refreshToken
    if (typeof window !== 'undefined') localStorage.setItem('refresh_token', refreshToken)
  }
}

function clearTokens() {
  _currentUser = null
  _accessToken = null
  _refreshToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

function dispatchChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:changed'))
  }
}

export function readAuth(): User | null {
  return _currentUser
}

export function isLoggedIn(): boolean {
  return _currentUser !== null
}

export function extractErrorMessage(err: unknown, fallback = 'Алдаа гарлаа'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message) return obj.message;
    if (typeof obj.error === 'string' && obj.error) return obj.error;
    if (typeof obj.error === 'object' && obj.error !== null) {
      const nested = obj.error as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message) return nested.message;
    }
  }
  return fallback;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(data.error, 'Нэвтрэх амжилтгүй боллоо') }
    _currentUser = data.user
    saveTokens(data.accessToken, data.refreshToken)
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function loginWithPhone(phone: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(data.error, 'Нэвтрэх амжилтгүй боллоо') }
    _currentUser = data.user
    saveTokens(data.accessToken, data.refreshToken)
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function register(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(json.error, 'Бүртгэл амжилтгүй боллоо') }
    _currentUser = json.user
    saveTokens(json.accessToken, json.refreshToken)
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  clearTokens()
  dispatchChange()
}

export async function sendRegisterOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/users/otp/send-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(data.error, 'OTP илгээхэд алдаа гарлаа') }
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function forgotPasswordSend(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/users/forgot-password/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(data.error, 'OTP илгээхэд алдаа гарлаа') }
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function forgotPasswordReset(phone: string, otpCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/users/forgot-password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otpCode, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(data.error, 'Нууц үг сэргээхэд алдаа гарлаа') }
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/users/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(data.error, 'OTP илгээхэд алдаа гарлаа') }
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function verifyOtp(
  phone: string,
  code: string,
  firstName?: string,
  lastName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/users/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, firstName, lastName }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: extractErrorMessage(data.error, 'OTP баталгаажуулахад алдаа гарлаа') }
    _currentUser = data.user
    saveTokens(data.accessToken, data.refreshToken)
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

// Fetch wrapper that auto-refreshes access token on 401 then retries once
export async function fetchWithAuth(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  const token = getStoredAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(input, { credentials: 'include', ...init, headers })
  if (res.status !== 401) return res

  // Try refresh
  const rToken = getStoredRefreshToken()
  const refreshRes = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken: rToken }),
  })
  if (!refreshRes.ok) return res
  const refreshData = await refreshRes.json().catch(() => ({}))
  saveTokens(refreshData.accessToken, refreshData.refreshToken)

  const retryHeaders = new Headers(init?.headers)
  const newToken = getStoredAccessToken()
  if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`)
  return fetch(input, { credentials: 'include', ...init, headers: retryHeaders })
}

// Call on app init to restore session from cookie or stored token
export async function restoreSession(): Promise<void> {
  try {
    const headers = new Headers()
    headers.set('Cache-Control', 'no-cache')
    const token = getStoredAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    let res = await fetch('/api/users/me', { credentials: 'include', headers, cache: 'no-store' })

    // Access token expired — try refresh
    if (res.status === 401) {
      const rToken = getStoredRefreshToken()
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: rToken }),
      })
      if (!refreshRes.ok) return
      const refreshData = await refreshRes.json().catch(() => ({}))
      saveTokens(refreshData.accessToken, refreshData.refreshToken)

      const retryHeaders = new Headers()
      retryHeaders.set('Cache-Control', 'no-cache')
      const newToken = getStoredAccessToken()
      if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`)
      res = await fetch('/api/users/me', { credentials: 'include', headers: retryHeaders, cache: 'no-store' })
    }

    if (res.status === 200) {
      const user = await res.json().catch(() => null)
      if (user && typeof user === 'object') {
        _currentUser = {
          email: user.email ?? '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          phone: user.phone ?? '',
          avatar: user.avatar ?? '',
        }
        dispatchChange()
      }
    }
  } catch {
    // no session
  }
}
