'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { readAuth, login, register, logout, type User } from '../lib/authStore';

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    setUser(readAuth());
    const onAuthChange = () => setUser(readAuth());
    window.addEventListener('auth:changed', onAuthChange);
    return () => window.removeEventListener('auth:changed', onAuthChange);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginPhone || !loginPassword) {
      setError('Утасны дугаар/И-мэйл болон нууц үгээ оруулна уу');
      return;
    }

    const result = await login(loginPhone, loginPassword);
    if (result.success) {
      setUser(readAuth());
      setSuccess('Амжилттай нэвтэрлээ!');
      // Redirect back to where the user came from (e.g. /checkout)
      setTimeout(() => router.replace(redirectTo), 300);
    } else {
      setError(result.error || 'Утасны дугаар/И-мэйл эсвэл нууц үг буруу байна');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regFirstName || !regLastName || !regPhone || !regEmail || !regPassword) {
      setError('Бүх талбарыг бөглөнө үү');
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
      email: regEmail,
      password: regPassword,
      firstName: regFirstName,
      lastName: regLastName,
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
    setLoginPhone('');
    setLoginPassword('');
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
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-800 mb-8 text-center">Нэвтрэх / Бүртгүүлэх</h1>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'login'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Нэвтрэх
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              activeTab === 'register'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Бүртгүүлэх
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар / И-мэйл</label>
              <input
                type="text"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="99xxxxxx эсвэл email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> Намайг сана
              </label>
              <button type="button" className="text-primary hover:underline">Нууц үг мартсан?</button>
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Нэвтрэх
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">эсвэл</span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              Бүртгэлгүй юу?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-primary font-medium hover:underline"
              >
                Бүртгүүлэх
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Овог *</label>
                <input
                  type="text"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Овог"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нэр *</label>
                <input
                  type="text"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Нэр"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар *</label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="99xxxxxx"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл *</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг *</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Хамгийн багадаа 6 тэмдэгт"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг баталгаажуулах *</label>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Нууц үгээ дахин оруулна уу"
                required
              />
            </div>
            <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Би <Link href="/terms" className="text-primary hover:underline">үйлчилгээний нөхцөл</Link> болон{' '}
                <Link href="/privacy" className="text-primary hover:underline">нууцлалын бодлогыг</Link> зөвшөөрч байна
              </span>
            </label>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Бүртгүүлэх
            </button>

            <div className="text-center text-sm text-gray-600">
              Бүртгэлтэй юу?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-primary font-medium hover:underline"
              >
                Нэвтрэх
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
