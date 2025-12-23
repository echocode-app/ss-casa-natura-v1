import Link from 'next/link';
import { lineeConfig } from '@/lib/lineeConfig';

export default function Line() {
  return (
    <div>
      <h4 className="font-semibold text-[14px] md:text-[16px] xl:text-[18px] uppercase mb-3 md:mb-4 lg:mb-6">
        Linee
      </h4>

      <ul className="flex flex-col">
        {Object.values(lineeConfig).map((line) => (
          <li key={line.slug} className="mb-2">
            <Link
              href={`/linee/${line.slug}`}
              className="font-normal text-[14px] md:text-[16px] xl:text-[18px] hover:underline"
            >
              {line.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
