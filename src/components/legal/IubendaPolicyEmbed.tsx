'use client';

import { useTranslations } from 'next-intl';

type PolicyKind = 'privacy' | 'cookie';

const IUBENDA_POLICY_ID = process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID || '12345678';

/**
 * External link to Iubenda privacy/cookie policy.
 * Opens in a new tab.
 */
export default function IubendaPolicyEmbed({
  kind,
  className = '',
  children,
}: {
  kind: PolicyKind;
  className?: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations('privacy');
  const isPrivacy = kind === 'privacy';
  const href = isPrivacy
    ? `https://www.iubenda.com/privacy-policy/${IUBENDA_POLICY_ID}`
    : `https://www.iubenda.com/privacy-policy/${IUBENDA_POLICY_ID}/cookie-policy`;
  const title = isPrivacy ? t('privacyPolicy.title') : t('cookiePolicy.title');

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={title}>
      {children || title}
    </a>
  );
}
