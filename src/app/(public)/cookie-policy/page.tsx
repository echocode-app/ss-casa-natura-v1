import { getTranslations } from 'next-intl/server';

export default async function CookiePolicyPage() {
  const t = await getTranslations('privacy');
  return (
    <div className="container py-20 mx-auto min-h-[70vh]">
      <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">{t('cookiePolicy.title')}</h1>

      <div className="mt-4 max-w-3xl text-[clamp(14px,2vw,18px)] text-text-muted">
        <p>{t('cookiePolicy.intro')}</p>

        <p className="mt-4">
          {t('cookiePolicy.contactPrompt')}{' '}
          <a href="/contatti" className="underline hover:no-underline">
            {t('cookiePolicy.contactLink')}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
