import Link from 'next/link';

const clientLinks = [
  { label: 'Missione', href: '/mission' },
  { label: 'Ingredienti', href: '/ingredienti' },
  { label: 'Servizio clienti', href: '/supporto' },
  { label: 'Il mio account', href: '/account' },
  { label: 'Note legali', href: '/legal' },
];

export default function Client() {
  return (
    <div>
      <h4 className="font-semibold text-[14px] md:text-[16px] xl:text-[18px] uppercase mb-3 md:mb-4 lg:mb-6">
        Area clienti
      </h4>

      <ul className="flex flex-col">
        {clientLinks.map(({ label, href }) => (
          <li key={label} className="mb-2">
            <Link
              href={href}
              className="font-normal text-[14px] md:text-[16px] xl:text-[18px] hover:underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
