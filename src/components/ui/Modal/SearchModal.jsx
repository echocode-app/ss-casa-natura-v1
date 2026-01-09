'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import ModalLayout from './ModalLayout';
import Spinner from '@/components/ui/Spinner/Spinner';
import { Icon } from '@/components/ui';
import { searchProducts } from '@/helpers/searchProducts';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';

const MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 10;
const DEFAULT_IMAGE = '/images/home/product.png';
const DEBOUNCE_MS = 500;

function ModalProductCard({ product, onClick }) {
  return (
    <Link
      href={`/prodotti/${product.slug}`}
      onClick={onClick}
      className="flex items-center gap-2 md:gap-3 border border-input rounded-input-sm md:rounded-input-xl px-3 py-2 bg-white hover:bg-brand-light transition-colors duration-300"
    >
      <img
        src={product.images?.[0]?.src || DEFAULT_IMAGE}
        alt={product.title}
        className="w-12 h-16 object-contain flex-shrink-0"
      />
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm line-clamp-2">{product.title}</span>
        <span className="text-sm font-semibold">€ {product.price.toFixed(2)}</span>
      </div>
    </Link>
  );
}

export default function SearchModal({ isOpen, onClose }) {
  const t = useTranslations('modal.search');

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showTopProducts, setShowTopProducts] = useState(true);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      setShowTopProducts(true);
      return;
    }

    setIsSearching(true);
    setShowTopProducts(false);

    const timeout = setTimeout(() => {
      try {
        const foundResults = searchProducts(normalizedQuery).slice(0, MAX_RESULTS);
        setResults(foundResults);
      } catch {
        // Handle search error silently
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [normalizedQuery]);

  const isEmpty =
    !isSearching && normalizedQuery.length >= MIN_QUERY_LENGTH && results.length === 0;

  const topProducts = PRODUCTS_MOCK.filter((p) => p.isBestSeller).slice(0, 3);

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-[380px] md:h-[400px] lg:h-[420px] w-full gap-3 lg:gap-4 transition-all duration-300">
        {/* Search Input */}
        <div className="flex items-center w-full rounded-input-sm md:rounded-input-xl border border-input bg-background-primary p-2 md:px-3 md:py-1 transition-all duration-300 focus-within:ring-1 focus-within:ring-border-input">
          <button className="p-2 md:mr-1 md:p-3 flex items-center justify-center text-text-gray hover:text-text-primary transition-all duration-300 md:hover:scale-105">
            <Icon id="search" className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('form.placeholder')}
            className="flex-1 bg-transparent text-text-primary text-[clamp(12px,2vw,20px)] placeholder:text-text-gray focus:outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 md:p-4 flex items-center justify-center text-text-gray hover:text-text-primary transition-all duration-300 md:hover:scale-105"
            >
              <Icon id="close" className="w-3 h-3 md:w-5 md:h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 transition-all duration-300 flex flex-col gap-2">
          {/* Top Products */}
          {showTopProducts && topProducts.length > 0 && (
            <div>
              <h3 className="font-semibold text-[clamp(16px,2vw,22px)] mb-2 ml-4">
                {t('topProductsTitle')}
              </h3>
              <div className="flex flex-col gap-2">
                {topProducts.map((product) => (
                  <ModalProductCard key={product.id} product={product} onClick={onClose} />
                ))}
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {isSearching && (
            <div className="flex justify-center m-auto py-8">
              <Spinner size="md" colorScheme="muted" />
            </div>
          )}

          {/* Search Results */}
          {!isSearching && !showTopProducts && results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((result, idx) => (
                <ModalProductCard
                  key={result.product.id + '-' + idx}
                  product={result.product}
                  onClick={onClose}
                />
              ))}
            </div>
          )}

          {/* Empty Search */}
          {isEmpty && (
            <p className="text-text-gray text-[clamp(14px,2vw,20px)] leading-relaxed text-center p-6 py-8 md:p-16 lg:py-20">
              {t('empty.text')}{' '}
              <Link
                href="/prodotti"
                onClick={onClose}
                className="underline hover:text-text-primary"
              >
                {t('empty.link')}
              </Link>
            </p>
          )}
        </div>

        {/* Footer Link*/}
        {!isEmpty && (showTopProducts || results.length > 0) && !isSearching && (
          <div className="flex justify-end px-3">
            <Link
              href="/prodotti"
              onClick={onClose}
              className="text-text-gray text-[clamp(14px,2vw,18px)] underline hover:text-text-primary transition-colors"
            >
              {t('link.allProducts')}
            </Link>
          </div>
        )}
      </div>
    </ModalLayout>
  );
}
