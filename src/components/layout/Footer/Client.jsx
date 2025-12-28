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
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        Area clienti
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
