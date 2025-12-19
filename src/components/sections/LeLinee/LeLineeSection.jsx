import {
  Lavanda,
  BrezzaMarina,
  AgrumiDiSicilia,
  FioreDiLoto,
  Marsiglia,
  Neutro,
} from '@/components/ui/LeLinee';

export default function LeLineeSection() {
  return (
    <section
      className="py-4 lg:py-6
    pb-4 md:pb-6 xl:pb-12"
    >
      <div className="mx-auto max-w-[1570px] px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Title */}
        <h2
          className="
            text-center
            text-[32px] md:text-[40px] xl:text-[47px]
            leading-[1.1]
            mb-6 xl:mb-[50px]
          "
        >
          Le linee
        </h2>

        {/* Grid */}
        <div
          className="
            grid
            grid-flow-col auto-cols-max gap-4
            overflow-x-auto pb-6 md:pb-0

            md:grid-flow-row md:grid-cols-2 md:gap-6 md:overflow-visible

            lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6

            xl:grid-cols-3
            xl:gap-x-[80px]
            xl:gap-y-[29px]
          "
        >
          <Lavanda />
          <BrezzaMarina />
          <AgrumiDiSicilia />

          <FioreDiLoto />
          <Marsiglia />
          <Neutro />
        </div>
      </div>
    </section>
  );
}
