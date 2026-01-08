import Link from 'next/link';
import { lineeConfig } from '@/lib/lineeConfig';
import { useTranslations } from 'next-intl';

export default function Line() {
  const t = useTranslations('footer');
  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        {t('lines')}
      </h4>

      <ul className="flex flex-col">
        {Object.values(lineeConfig).map((line) => (
          <li key={line.slug} className="mb-2">
            <Link
              href={`/linee/${line.slug}`}
              className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
            >
              {line.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
