'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { readAuth, login, register, logout, sendOtp, verifyOtp, type User } from '../lib/authStore';

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP login
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Register form
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    setUser(readAuth());
    const onAuthChange = () => setUser(readAuth());
    window.addEventListener('auth:changed', onAuthChange);
    return () => window.removeEventListener('auth:changed', onAuthChange);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpPhone || otpPhone.length < 8) {
      setError('Зөв утасны дугаар оруулна уу');
      return;
    }
    setLoading(true);
    const result = await sendOtp(otpPhone);
    setLoading(false);
    if (result.success) {
      setOtpSent(true);
    } else {
      setError(result.error || 'OTP илгээхэд алдаа гарлаа');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.length !== 6) {
      setError('6 оронтой OTP код оруулна уу');
      return;
    }
    setLoading(true);
    const result = await verifyOtp(otpPhone, otpCode);
    setLoading(false);
    if (result.success) {
      setUser(readAuth());
      setSuccess('Амжилттай нэвтэрлээ!');
      setTimeout(() => router.replace(redirectTo), 300);
    } else {
      setError(result.error || 'OTP код буруу байна');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regPhone || !regPassword) {
      setError('Утасны дугаар болон нууц үгээ оруулна уу');
      return;
    }

    if (regPassword.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Нууц үг таарахгүй байна');
      return;
    }

    if (!agreeTerms) {
      setError('Үйлчилгээний нөхцөлийг зөвшөөрнө үү');
      return;
    }

    const result = await register({
      phone: regPhone,
      email: `${regPhone}@phone.local`,
      password: regPassword,
      firstName: regPhone,
      lastName: '',
    });

    if (result.success) {
      setUser(readAuth());
      setSuccess('Амжилттай бүртгүүллээ!');
      // Redirect back to where the user came from (e.g. /checkout)
      setTimeout(() => router.replace(redirectTo), 300);
    } else {
      setError(result.error || 'Бүртгэл амжилтгүй боллоо');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setActiveTab('login');
    setOtpPhone('');
    setOtpCode('');
    setOtpSent(false);
    setRegPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
  };

  // Logged in state
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-800 mb-8">Миний бүртгэл</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user.lastName} {user.firstName}</p>
                  <p className="text-xs text-gray-500">{user.phone}</p>
                </div>
              </div>
            </div>

            <Link
              href="/account"
              className="block px-4 py-3 rounded-xl bg-red-50 text-primary font-medium text-sm"
            >
              👤 Хувийн мэдээлэл
            </Link>
            <Link
              href="/account/wishlists"
              className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
            >
              ❤️ Хадгалсан бараа
            </Link>
            <Link
              href="/checkout"
              className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
            >
              🛒 Миний сагс
            </Link>
            <Link
              href="/account/orders"
              className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
            >
              📦 Захиалгын түүх
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium text-sm transition-colors"
            >
              🚪 Гарах
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Хувийн мэдээлэл</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Овог</label>
                  <input
                    type="text"
                    value={user.lastName}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Нэр</label>
                  <input
                    type="text"
                    value={user.firstName}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Утасны дугаар</label>
                  <input
                    type="text"
                    value={user.phone}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">И-мэйл</label>
                  <input
                    type="text"
                    value={user.email}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Хүргэлтын хаяг</h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Улаанбаатар хот, Хан-Уул дүүрэг</p>
                <p className="text-sm text-gray-600">Их Наяд худалдааны төв, 3 давхар</p>
                <button className="mt-3 text-sm text-primary font-medium hover:underline">
                  Хаяг өөрчлөх
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in - show login/register forms
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {activeTab === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'login' ? 'Утасны дугаараар нэвтэрнэ үү' : 'Шинэ бүртгэл үүсгэх'}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-600">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {success}
          </div>
        )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100 p-7">
        {/* Tabs */}
        <div className="flex gap-1 mb-7 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); setOtpSent(false); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Нэвтрэх
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Бүртгүүлэх
          </button>
        </div>

        {/* OTP Login Form */}
        {activeTab === 'login' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </span>
                  <input
                    type="tel"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                    placeholder="Утасны дугаар"
                    maxLength={12}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-60 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Илгээж байна...
                    </span>
                  ) : 'Код авах →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 text-center">
                  📱 <span className="font-semibold">{otpPhone}</span>-д код илгээлээ
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                  placeholder="──────"
                  maxLength={6}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Шалгаж байна...
                    </span>
                  ) : 'Нэвтрэх'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 py-1"
                >
                  ← Буцах
                </button>
              </form>
            )}
          </div>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </span>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                placeholder="Утасны дугаар"
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                placeholder="Нууц үг (6+ тэмдэгт)"
                minLength={6}
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </span>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50"
                placeholder="Нууц үг давтах"
                required
              />
            </div>
            <label className="flex items-start gap-2.5 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span>
                <Link href="/terms" className="text-primary hover:underline">Үйлчилгээний нөхцөл</Link> болон{' '}
                <Link href="/privacy" className="text-primary hover:underline">нууцлалын бодлогыг</Link> зөвшөөрч байна
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-60"
            >
              {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх →'}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
