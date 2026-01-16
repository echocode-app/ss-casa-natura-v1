'use client';

import Script from 'next/script';

type PolicyKind = 'privacy' | 'cookie';

const IUBENDA_SCRIPT_SRC = 'https://cdn.iubenda.com/iubenda.js';

export default function IubendaPolicyEmbed({
  kind,
  className = '',
  children,
}: {
  kind: PolicyKind;
  className?: string;
  children?: React.ReactNode;
}) {
  const isPrivacy = kind === 'privacy';

  const href = isPrivacy
    ? 'https://www.iubenda.com/privacy-policy/21492154'
    : 'https://www.iubenda.com/privacy-policy/21492154/cookie-policy';

  const title = isPrivacy ? 'Privacy Policy ' : 'Cookie Policy ';
  const fallbackLabel = isPrivacy ? 'Privacy Policy' : 'Cookie Policy';

  return (
    <>
      <a
        href={href}
        className={`iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe ${className}`}
        title={title}
      >
        {children || fallbackLabel}
      </a>

      <Script src={IUBENDA_SCRIPT_SRC} strategy="afterInteractive" />
    </>
  );
}
