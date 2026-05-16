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

// Call on app init to restore session from cookie (asks server to validate)
export async function restoreSession(): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/users/me`, { credentials: 'include' })
    if (res.ok) {
      const user = await res.json()
      _currentUser = { email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone }
      dispatchChange()
    }
  } catch {
    // no session
  }
}
