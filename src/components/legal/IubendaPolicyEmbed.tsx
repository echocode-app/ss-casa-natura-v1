'use client';

import Script from 'next/script';

type PolicyKind = 'privacy' | 'cookie';

const IUBENDA_SCRIPT_SRC = 'https://cdn.iubenda.com/iubenda.js';

export default function IubendaPolicyEmbed({
  kind,
  className = '',
  children,
  openInNewTab = true,
}: {
  kind: PolicyKind;
  className?: string;
  children?: React.ReactNode;
  openInNewTab?: boolean;
}) {
  const isPrivacy = kind === 'privacy';

  const iubendaEnabled = process.env.NEXT_PUBLIC_IUBENDA_ENABLED === 'true';
  const iubendaCookiePolicyId = process.env.NEXT_PUBLIC_IUBENDA_COOKIE_POLICY_ID;
  const shouldUseIubenda = Boolean(iubendaEnabled && iubendaCookiePolicyId);

  const href = shouldUseIubenda
    ? isPrivacy
      ? `https://www.iubenda.com/privacy-policy/${iubendaCookiePolicyId}`
      : `https://www.iubenda.com/privacy-policy/${iubendaCookiePolicyId}/cookie-policy`
    : isPrivacy
      ? '/privacy-policy'
      : '/cookie-policy';

  const title = isPrivacy ? 'Privacy Policy ' : 'Cookie Policy ';
  const fallbackLabel = isPrivacy ? 'Privacy Policy' : 'Cookie Policy';

  return (
    <>
      <a
        href={href}
        target={shouldUseIubenda && openInNewTab ? '_blank' : undefined}
        rel={shouldUseIubenda && openInNewTab ? 'noopener noreferrer' : undefined}
        className={`iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe ${className}`}
        title={title}
      >
        {children || fallbackLabel}
      </a>

      {shouldUseIubenda && !openInNewTab && (
        <Script id="iubenda-policy-embed" src={IUBENDA_SCRIPT_SRC} strategy="afterInteractive" />
      )}
    </>
  );
}
