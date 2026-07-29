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
    if (data.accessToken) _accessToken = data.accessToken
    if (data.refreshToken) _refreshToken = data.refreshToken
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
    if (data.accessToken) _accessToken = data.accessToken
    if (data.refreshToken) _refreshToken = data.refreshToken
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
    if (json.accessToken) _accessToken = json.accessToken
    if (json.refreshToken) _refreshToken = json.refreshToken
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  _currentUser = null
  _accessToken = null
  _refreshToken = null
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
    if (data.accessToken) _accessToken = data.accessToken
    if (data.refreshToken) _refreshToken = data.refreshToken
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

// Fetch wrapper that auto-refreshes access token on 401 then retries once
export async function fetchWithAuth(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (_accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${_accessToken}`)
  }
  const res = await fetch(input, { credentials: 'include', ...init, headers })
  if (res.status !== 401) return res
  // Try refresh
  const refreshRes = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken: _refreshToken }),
  })
  if (!refreshRes.ok) return res
  const refreshData = await refreshRes.json().catch(() => ({}))
  if (refreshData.accessToken) _accessToken = refreshData.accessToken
  if (refreshData.refreshToken) _refreshToken = refreshData.refreshToken

  const retryHeaders = new Headers(init?.headers)
  if (_accessToken) retryHeaders.set('Authorization', `Bearer ${_accessToken}`)
  return fetch(input, { credentials: 'include', ...init, headers: retryHeaders })
}

// Call on app init to restore session from cookie (asks server to validate)
export async function restoreSession(): Promise<void> {
  try {
    const headers = new Headers()
    if (_accessToken) headers.set('Authorization', `Bearer ${_accessToken}`)
    let res = await fetch('/api/users/me', { credentials: 'include', headers })

    // Access token expired — try refresh
    if (res.status === 401) {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: _refreshToken }),
      })
      if (!refreshRes.ok) return
      const refreshData = await refreshRes.json().catch(() => ({}))
      if (refreshData.accessToken) _accessToken = refreshData.accessToken
      if (refreshData.refreshToken) _refreshToken = refreshData.refreshToken

      const retryHeaders = new Headers()
      if (_accessToken) retryHeaders.set('Authorization', `Bearer ${_accessToken}`)
      res = await fetch('/api/users/me', { credentials: 'include', headers: retryHeaders })
    }

    if (res.ok) {
      const user = await res.json()
      _currentUser = { email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatar: user.avatar }
      dispatchChange()
    }
  } catch {
    // no session
  }
}
