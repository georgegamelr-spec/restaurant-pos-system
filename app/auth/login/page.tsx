'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        setError('البريد الإلكتروني وكلمة المرور مطلوبان');
        return;
      }

      // Call loginUser from lib/auth.ts (it's async)
      const result = await loginUser(email, password);

      if (result.success) {
        console.log('Login successful:', { email, user: result.user });
        // Redirect to the intended page or admin dashboard
        router.push(redirect);
      } else {
        setError(result.error || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('خطأ في عملية الدخول');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">دخول منظومة POS</h1>
          <p className="text-center text-gray-600 mb-6">نظام إدارة مطاعم</p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري...' : 'دخول'}
            </button>
          </form>

          <p className="text-center mt-4 text-gray-600">
            لا تملك حساب؟{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              سجل الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
