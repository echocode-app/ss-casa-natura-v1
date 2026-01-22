'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/layout/AuthContext';
import AuthModal from '@/components/ui/Modal/AuthModal';

export default function Client() {
  const t = useTranslations('footer');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const clientLinks: Array<{
    label: string;
    href: string;
    isAccount?: boolean;
    isExternal?: boolean;
  }> = [
    { label: t('links.mission'), href: '/mission' },
    { label: t('links.support'), href: '/contatti' },
    { label: t('links.account'), href: '/account', isAccount: true },
    {
      label: t('links.legal'),
      href: '/privacy-policy',
    },
  ];

  const handleAccountClick = (e: any) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowModal(true);
    } else {
      router.push('/account');
    }
  };

  if (!isClient) return null;

  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        {t('clientArea')}
      </h4>

      <ul className="flex flex-col">
        {clientLinks.map(({ label, href, isAccount, isExternal }) => (
          <li key={label} className="mb-2">
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
              >
                {label}
              </a>
            ) : (
              <Link
                href={href}
                onClick={isAccount ? handleAccountClick : undefined}
                className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} initialType="login" />
    </div>
  );
}
