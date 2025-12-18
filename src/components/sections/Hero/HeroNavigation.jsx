"use client";

export default function HeroNavigation() {
  return (
    <>
      <button
        className="
          hero-prev
          absolute left-4 top-1/2 -translate-y-1/2 z-20
          w-12 h-12 rounded-full
          bg-brand-accent
          flex items-center justify-center
          hover:opacity-90 transition
        "
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        className="
          hero-next
          absolute right-4 top-1/2 -translate-y-1/2 z-20
          w-12 h-12 rounded-full
          bg-brand-accent
          flex items-center justify-center
          hover:opacity-90 transition
        "
        aria-label="Next slide"
      >
        ›
      </button>
    </>
  );
}
