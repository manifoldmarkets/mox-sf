'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/portal/api/session');
        if (response.ok) {
          const data = await response.json();
          if (data.isLoggedIn) {
            router.push('/portal');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/portal/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Check your email! We sent you a login link.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to send email. Please try again.');
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 px-4">
        <div className="text-gray-600 dark:text-gray-400">Checking session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-400 mb-2 font-playfair">Member Portal</h1>
          <p className="text-gray-600 dark:text-gray-400 font-sans">Sign in to edit your profile and manage your membership</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-sans">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:border-amber-500 dark:focus:border-amber-600 font-sans"
                placeholder="your@email.com"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg font-sans ${
                  status === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-amber-800 dark:bg-amber-700 text-white py-2 px-4 rounded-lg hover:bg-amber-900 dark:hover:bg-amber-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-sans"
            >
              {status === 'loading' ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 font-sans">
            <p>We'll email you a secure link to access your profile.</p>
            <p className="mt-1">The link expires in 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
