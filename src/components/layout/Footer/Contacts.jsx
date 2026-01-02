import { Instagram, Facebook } from '@/components/ui/Buttons';

export default function Contacts() {
  return (
    <div>
      <h4 className="font-semibold text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] uppercase mb-3 md:mb-4 lg:mb-6">
        Contatti
      </h4>

      <ul className="flex flex-col mb-1 md:mb-6 gap-2">
        <li>
          <a
            href="https://maps.google.com"
            target="_blank"
            className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline"
          >
            Sede produttiva – Casalmaiocco (LO)
          </a>
        </li>
        <li>
          <a
            href="tel:+39000000000"
            className="font-normal text-[clamp(14px,5vw,18px)] leading-[clamp(20px, 5vw, 30px)] hover:underline tabular"
          >
            Tel. 000000000000
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

      <div className="flex items-center gap-4 md:gap-6">
        <Instagram size={35} />
        <Facebook size={35} />
      </div>
    </div>
  );
}
