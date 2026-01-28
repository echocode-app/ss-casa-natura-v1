'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Check from '@/components/ui/Buttons/Check';
import User from '@/components/ui/Buttons/User';

type CheckoutSuccessClientProps = {
  translations: {
    title: string;
    description: string;
    toCatalog: string;
    toAccount: string;
  };
};

export default function CheckoutSuccessClient({ translations }: CheckoutSuccessClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Clear cart from localStorage - use the correct key from CartContext
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_cart_v1');
      // Also clear the old key for backward compatibility
      localStorage.removeItem('cart');
      // Trigger storage event to update cart context
      window.dispatchEvent(new Event('storage'));
    }

    // Block back navigation to checkout
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      router.push('/');
    };

    // Replace current history entry to prevent going back
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  return (
    <section className="px-6 md:px-8 lg:px-10 py-10 md:py-16 lg:pb-32">
      <div className="max-w-[900px] mx-auto flex items-center justify-center">
        <div className="w-full flex flex-col items-center text-center">
          <h1 className="heading-default heading-sm md:heading-lg xl:heading-xl font-semibold mb-4 md:mb-6">
            {translations.title}
          </h1>

          <div className="mb-6 md:mb-8">
            <Check />
          </div>

          <p className="text-text-muted text-[clamp(16px,2vw,22px)] leading-relaxed mb-8 md:mb-10">
            {translations.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 items-center justify-center">
            <Link
              href="/prodotti"
              className="
                relative
                bg-brand-accent
                text-black
                font-semibold
                text-[clamp(14px,2vw,22px)]
                text-center
                rounded-[25px]
                transition-all duration-300
                hover:shadow-header
                hover:opacity-90
                focus:outline-none
                focus:shadow-header
                focus:ring-0
                active:outline-none
                active:ring-0
                px-8 py-4
                inline-flex items-center justify-center
              "
            >
              {translations.toCatalog}
            </Link>
            <Link
              href="/account"
              className="group inline-flex items-center gap-2 text-brand-dark hover:underline text-[clamp(14px,1.6vw,18px)] transition-transform duration-300"
            >
              <User className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 md:group-hover:scale-110 md:group-focus-visible:scale-110" />
              {translations.toAccount}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
