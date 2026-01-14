'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function NotFound() {
  const t = useTranslations('notFound');
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-brand-primary mb-4">404</h1>
        </div>

        <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4">{t('title')}</h2>

        <p className="text-lg text-text-soft mb-8">{t('description')}</p>

        {countdown > 0 && (
          <p className="text-base text-text-soft mb-6">
            {t('redirecting', {
              seconds: countdown,
              plural: countdown !== 1 ? 'i' : 'o',
            })}
          </p>
        )}

        <Link href="/" className="inline-block">
          <PrimaryButton onClick={() => {}} className="min-w-[200px] py-4 text-lg">
            {t('backHome')}
          </PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
