'use client';
import { useTranslations } from 'next-intl';

export default function Privacy() {
  const t = useTranslations('footer');
  const policyId = process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID || '12345678';
  const href = `https://www.iubenda.com/privacy-policy/${policyId}`;
  const currentYear = new Date().getFullYear();

  return (
    <p className="text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] text-white break-words tabular">
      © {currentYear} Casa Natura / {t('copyrightText')} /{' '}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:underline"
      >
        {t('privacyLink')}
      </a>
    </p>
  );
}
