'use client';

import { useState, useEffect } from 'react';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Chevron from '@/components/ui/Buttons/Chevron';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { useTranslations } from 'next-intl';

export default function ProductsFiltersSection({
  activeFilter,
  setActiveFilter,
  _isOpen,
  onToggle,
  onApply,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const t = useTranslations('prodotti.filters');

  useEffect(() => {
    if (typeof window !== 'undefined') setInternalOpen(window.innerWidth >= 1024);
  }, []);

  const toggleOpen = () => {
    setInternalOpen((prev) => !prev);
    onToggle?.(!internalOpen);
  };

  const handleCheckboxChange = (categoryId) => {
    if (!categoryId) return;
    setActiveFilter((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const handleSegmentClick = (segment) => {
    if (segment.categoryIds?.length) setActiveFilter([...segment.categoryIds]);
    else setActiveFilter([]);
  };

  return (
    <aside className="w-full lg:w-[340px] xl:w-[380px] lg:h-[600px] xl:h-[660px] shrink-0">
      <div className="bg-white rounded-[34px] px-6 py-8 md:px-8 pb-4">
        <div className="flex items-center justify-between mb-3 lg:mb-5">
          <h2 className="font-semibold text-[clamp(22px,2vw,28px)] uppercase pl-12 md:pl-7 lg:pl-16">
            {t('title')}
          </h2>
          <button
            onClick={toggleOpen}
            aria-expanded={internalOpen}
            className="px-2 py-3 lg:px-3 lg:py-4 flex items-center justify-center bg-brand-accent text-black"
          >
            <Chevron
              className={`fill-current transition-transform duration-300 ${internalOpen ? 'rotate-0' : '-rotate-180'}`}
            />
          </button>
        </div>

        <div className="border-b border-[#8D8D8D] mb-5" />

        <div
          className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${internalOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] lg:grid-cols-1 gap-x-6 gap-y-3">
            {PRODUCT_FILTERS.map((segment) => (
              <div
                key={segment.id}
                className="mb-3 pb-3 border-b border-[#8D8D8D] md:border-none lg:border-solid"
              >
                <h3
                  className="font-semibold text-[clamp(20px,3vw,28px)] uppercase mb-3 md:mb-4 lg:mb-2 pl-12 md:pl-7 lg:pl-16 cursor-pointer"
                  onClick={() => handleSegmentClick(segment)}
                >
                  {segment.title}
                </h3>
                <div className="flex flex-col gap-1 lg:gap-0">
                  {segment.items?.map((item, i) => {
                    const categoryId = segment.categoryIds?.[i];
                    return (
                      <label
                        key={categoryId || i}
                        className="flex items-center gap-7 md:gap-2 lg:gap-10 font-light text-[clamp(16px,3vw,23px)] leading-[31px] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={categoryId && activeFilter.includes(categoryId)}
                          onChange={() => handleCheckboxChange(categoryId)}
                          className="accent-brand-accent w-6 lg:h-5 cursor-pointer"
                        />
                        {item}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="md:border-b border-[#8D8D8D] lg:border-none" />

          <div className="py-3 px-1 md:mt-3 lg:mt-0">
            <PrimaryButton
              onClick={onApply}
              className="w-full text-[clamp(12px,4vw,22px)] py-4 xl:py-5 text-center flex justify-center items-center"
            >
              {t('apply')}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </aside>
  );
}
