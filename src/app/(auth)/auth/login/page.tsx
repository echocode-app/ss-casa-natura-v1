'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useAuth } from '@/components/layout/AuthContext';
import { getGuestCartPayload } from '@/lib/utils/guestCartClient';
import { useTranslations } from 'next-intl';

const ALLOWED_ROLES = ['developer', 'superadmin', 'admin'];

export default function LoginPage() {
  const { login } = useAuth();
  const t = useTranslations('authLogin');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const redirectTarget = useMemo(() => {
    const redirectParam = searchParams?.get('redirect');
    if (redirectParam && redirectParam.startsWith('/')) {
      return redirectParam;
    }
    return '/admin';
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, guestCart: getGuestCartPayload() || undefined }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data?.error ||
          data?.details?.password?.[0] ||
          data?.details?.email?.[0] ||
          t('errors.loginFailed');
        setError(message);
        return;
      }

      const isLoggedIn = await login();

      if (!isLoggedIn) {
        setError(t('errors.profileRefresh'));
        return;
      }

      // Check admin access rights.
      if (redirectTarget.startsWith('/admin')) {
        // Allow time for user context update.
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check role after login (user will be updated).
        const res = await fetch('/api/users/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          if (!ALLOWED_ROLES.includes(userData.role)) {
            setSuccess(t('success.loginRedirectNoAdmin'));
            router.replace('/');
            return;
          }
        }
      }

      setSuccess(t('success.loginRedirect'));
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.replace(redirectTarget);
    } catch {
      setError(t('errors.unexpected'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,252,138,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.05),transparent_30%)]" />
      <div className="relative max-w-4xl mx-auto px-4 py-12 lg:py-16 flex flex-col lg:flex-row gap-10 items-center">
        <div className="flex-1 w-full">
          <p className="text-sm uppercase tracking-[0.2em] text-[#FFFC8A]/80 font-semibold mb-3">
            Casa Natura
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {t('title')}
          </h1>
          <p className="text-slate-200/80 text-base">{t('description')}</p>
          <div className="mt-8 flex gap-4 text-sm text-slate-300/80">
            <Link
              href="/"
              className="underline underline-offset-4 decoration-[#FFFC8A]/70 hover:decoration-[#FFFC8A]"
            >
              {t('backToSite')}
            </Link>
            <Link
              href="/contatti"
              className="underline underline-offset-4 decoration-slate-500 hover:decoration-white"
            >
              {t('needHelp')}
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-slate-900/50 backdrop-blur-xl p-8">
          <div className="mb-6">
            <p className="text-sm text-slate-200/80 mb-1">{t('secureAccess')}</p>
            <h2 className="text-2xl font-semibold text-white">{t('restrictedArea')}</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-400/10 text-emerald-50 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="email">
                {t('form.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFFC8A] focus:border-transparent transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-200" htmlFor="password">
                {t('form.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFFC8A] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFFC8A] px-4 py-3 text-slate-900 font-semibold shadow-lg shadow-[#FFFC8A]/30 hover:shadow-xl hover:shadow-[#FFFC8A]/40 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" colorScheme="muted" className="!border-slate-900" />
                  <span>{t('actions.loggingIn')}</span>
                </>
              ) : (
                <span>{t('actions.login')}</span>
              )}
            </button>

            <p className="text-xs text-slate-300/80 text-center">
              {t('redirectNotice', { target: redirectTarget })}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
