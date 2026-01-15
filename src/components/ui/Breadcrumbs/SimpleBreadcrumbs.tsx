import Link from 'next/link';

export type SimpleBreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: SimpleBreadcrumbItem[];
  className?: string;
};

export default function SimpleBreadcrumbs({ items, className }: Props) {
  if (!items?.length) return null;

  return (
    <section className={className || 'py-6 lg:py-9'}>
      <div className="flex flex-wrap gap-2 items-center max-w-[1570px] mx-auto px-4 md:px-8 lg:px-10 xl:px-12 text-[clamp(14px,2vw,17px)] leading-[clamp(24px,2vw,31px)] text-text-primary">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          if (isLast) {
            return (
              <span key={`${item.label}-${idx}`} className="text-[#545454] underline">
                {item.label}
              </span>
            );
          }

          if (!item.href) {
            return (
              <span key={`${item.label}-${idx}`} className="text-[#545454] underline">
                {item.label}
              </span>
            );
          }

          return (
            <span key={`${item.label}-${idx}`} className="flex items-center gap-2">
              <Link
                href={item.href}
                className="transition-all duration-300 hover:underline text-text-primary"
              >
                {item.label}
              </Link>
              <span className="text-text-primary">|</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
