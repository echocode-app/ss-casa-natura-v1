import { Instagram, Facebook } from '@/components/ui/Buttons';

export default function Contacts() {
  return (
    <div>
      <h4 className="font-semibold text-[14px] md:text-[16px] xl:text-[18px] uppercase mb-3 md:mb-4 lg:mb-6">
        Contatti
      </h4>

      <ul className="flex flex-col mb-1 md:mb-6 gap-2">
        <li>
          <a
            href="https://maps.google.com"
            target="_blank"
            className="font-normal text-[14px] md:text-[16px] xl:text-[18px] hover:underline"
          >
            Sede produttiva – Casalmaiocco (LO)
          </a>
        </li>
        <li>
          <a
            href="tel:+39000000000"
            className="font-normal text-[14px] md:text-[16px] xl:text-[18px] hover:underline"
          >
            Tel. 000000000000
          </a>
        </li>
        <li>
          <a
            href="mailto:info@casanatura.it"
            className="font-normal text-[14px] md:text-[16px] xl:text-[18px] hover:underline"
          >
            info@casanatura.it
          </a>
        </li>
      </ul>

      <div className="flex items-center gap-[25px]">
        <Instagram size={35} />
        <Facebook size={35} />
      </div>
    </div>
  );
}
