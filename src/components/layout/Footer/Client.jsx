import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Client() {
  const t = useTranslations('footer');
  const clientLinks = [
    { label: t('links.mission'), href: '/mission' },
    { label: t('links.ingredients'), href: '/ingredienti' },
    { label: t('links.support'), href: '/supporto' },
    { label: t('links.account'), href: '/account' },
    { label: t('links.legal'), href: '/legal' },
  ];
  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        {t('clientArea')}
      </h4>

      <ul className="flex flex-col">
        {clientLinks.map(({ label, href }) => (
          <li key={label} className="mb-2">
            <Link
              href={href}
              className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
