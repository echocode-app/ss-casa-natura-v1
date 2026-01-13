export default function ProductCardSkeleton() {
  return (
    <div className="group bg-white/90 rounded-[20px] flex flex-col h-full p-4 md:p-5 xl:p-6 gap-3 border border-bg-brand-soft md:border-none animate-pulse">
      {/* Image skeleton */}
      <div className="relative flex items-center justify-center rounded-[16px] overflow-hidden w-full m-auto aspect-[3/4] md:aspect-square lg:aspect-[3/4] bg-gray-200" />

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 mt-2">
        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
        </div>

        {/* Volume/Price skeleton */}
        <div className="flex items-center justify-between gap-3 mt-auto">
          <div className="flex flex-col gap-3">
            <div className="h-5 bg-gray-200 rounded w-16" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>

          {/* Button skeleton */}
          <div className="hidden max-[500px]:flex">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
          </div>

          <div className="hidden min-[501px]:flex lg:hidden">
            <div className="h-10 bg-gray-200 rounded-full w-24" />
          </div>
        </div>

        {/* Desktop button skeleton */}
        <div className="mt-auto pt-4 hidden lg:block">
          <div className="h-14 bg-gray-200 rounded-full w-full" />
        </div>
      </div>
    </div>
  );
}
