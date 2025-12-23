import { lineeConfig } from '@/lib/lineeConfig';
import LeLineeItem from '@/components/ui/LeLinee/LeLineeItem';

export default function OtherLinesSection({ currentSlug }) {
  const otherLines = Object.values(lineeConfig).filter((line) => line.slug !== currentSlug);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1570px] px-2 md:px-8">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-12">Scopri le altre linee</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {otherLines.map((line) => (
            <LeLineeItem
              key={line.slug}
              title={line.title}
              imageSrc={line.cardImage}
              slug={line.slug}
              variant="page"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
