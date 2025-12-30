'use client';

import { useState, useEffect } from 'react';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Chevron from '@/components/ui/Buttons/Chevron';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';

export default function ProductsFiltersSection({ isOpen, onToggle }) {
  const [internalOpen, setInternalOpen] = useState(isOpen);

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const [selectedFilters, setSelectedFilters] = useState({});

  const toggleOpen = () => {
    const newState = !internalOpen;
    setInternalOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const handleCheckboxChange = (segment, item) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        [item]: !prev[segment]?.[item],
      },
    }));
  };

  const handleApplyFilters = () => {
    console.log('Selected filters:', selectedFilters);
  };

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="font-semibold text-[clamp(16px,5vw,28px)] uppercase">LINEE</h2>
        <button
          onClick={toggleOpen}
          aria-expanded={internalOpen}
          className="p-2 rounded-md flex items-center justify-center bg-brand-accent lg:hidden"
        >
          <Chevron
            className={`${internalOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-300`}
          />
        </button>
      </div>

      <div className="border-b border-[#8D8D8D] mb-4 lg:mb-6" />

      <div
        className={`
          transition-all duration-300 overflow-hidden
          ${internalOpen ? 'max-h-[2000px]' : 'max-h-0'}
          lg:max-h-none lg:block bg-white rounded-[34px] p-4 lg:p-8
        `}
      >
        {PRODUCT_FILTERS.map((segment) => (
          <div key={segment.id} className="mb-6 pb-6 border-b last:border-b-0 border-[#8D8D8D]">
            <h3 className="font-semibold text-[clamp(20px,4vw,28px)] uppercase mb-2">
              {segment.title}
            </h3>
            <div className="flex flex-col gap-2">
              {segment.items?.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-4 font-light text-[clamp(16px,3vw,23px)] leading-[31px]"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters[segment.title]?.[item] || false}
                    onChange={() => handleCheckboxChange(segment.title, item)}
                    className="accent-brand-accent w-5 h-5"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}

        <PrimaryButton className="w-full mt-4" onClick={handleApplyFilters}>
          Applica filtri
        </PrimaryButton>
      </div>
    </aside>
  );
}
