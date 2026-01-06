'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthContext';
import AuthModal from '@/components/ui/Modal/AuthModal';

export default function Client() {
  const t = useTranslations('footer');
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const clientLinks = [
    { label: t('links.mission'), href: '/mission' },
    { label: t('links.ingredients'), href: '/ingredienti' },
    { label: t('links.support'), href: '/supporto' },
    { label: t('links.account'), href: '/account', isAccount: true },
    { label: t('links.legal'), href: '/legal' },
  ];

  const handleAccountClick = (e: any) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        {t('clientArea')}
      </h4>

      <ul className="flex flex-col">
        {clientLinks.map(({ label, href, isAccount }) => (
          <li key={label} className="mb-2">
            <Link
              href={href}
              onClick={isAccount ? handleAccountClick : undefined}
              className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
