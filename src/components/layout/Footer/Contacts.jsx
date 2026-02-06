import { useTranslations } from 'next-intl';

export default function Contacts() {
  const t = useTranslations('footer');
  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        {t('contacts')}
      </h4>
      <ul className="flex flex-col mb-1 md:mb-6 gap-2">
        <li>
          <a
            href="https://maps.app.goo.gl/wxJuUEhufe2ZBoM19"
            target="_blank"
            className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
          >
            {t('address')}
          </a>
        </li>
        <li>
          <a
            href="mailto:info@casanatura.it"
            className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
          >
            info@casanatura.it
          </a>
        </li>
      </ul>
    </div>
  );
}
