'use client'

export type User = {
  email: string
  firstName: string
  lastName: string
  phone?: string
}

// In-memory auth state (set after API login, cleared on logout)
let _currentUser: User | null = null

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

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error ?? 'Нэвтрэх амжилтгүй боллоо' }
    _currentUser = data.user
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
    if (!res.ok) return { success: false, error: data.error ?? 'Нэвтрэх амжилтгүй боллоо' }
    _currentUser = data.user
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
    if (!res.ok) return { success: false, error: json.error ?? 'Бүртгэл амжилтгүй боллоо' }
    _currentUser = json.user
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  _currentUser = null
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
    if (!res.ok) return { success: false, error: data.error ?? 'OTP илгээхэд алдаа гарлаа' }
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
    if (!res.ok) return { success: false, error: data.error ?? 'OTP илгээхэд алдаа гарлаа' }
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
    if (!res.ok) return { success: false, error: data.error ?? 'Нууц үг сэргээхэд алдаа гарлаа' }
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
    if (!res.ok) return { success: false, error: data.error ?? 'OTP илгээхэд алдаа гарлаа' }
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
    if (!res.ok) return { success: false, error: data.error ?? 'OTP баталгаажуулахад алдаа гарлаа' }
    _currentUser = data.user
    dispatchChange()
    return { success: true }
  } catch {
    return { success: false, error: 'Сервертэй холбогдох боломжгүй байна' }
  }
}

// Fetch wrapper that auto-refreshes access token on 401 then retries once
export async function fetchWithAuth(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, { credentials: 'include', ...init })
  if (res.status !== 401) return res
  // Try refresh
  const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
  if (!refreshRes.ok) return res
  // Retry original request
  return fetch(input, { credentials: 'include', ...init })
}

// Call on app init to restore session from cookie (asks server to validate)
export async function restoreSession(): Promise<void> {
  try {
    let res = await fetch('/api/users/me', { credentials: 'include' })

    // Access token expired — try refresh
    if (res.status === 401) {
      const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      if (!refreshRes.ok) return
      res = await fetch('/api/users/me', { credentials: 'include' })
    }

    if (res.ok) {
      const user = await res.json()
      _currentUser = { email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone }
      dispatchChange()
    }
  } catch {
    // no session
  }
}
