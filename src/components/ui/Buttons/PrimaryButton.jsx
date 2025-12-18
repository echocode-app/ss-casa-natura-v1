'use client';

export default function PrimaryButton({ children, onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        bg-brand-accent
        text-black
        font-semibold
        text-[clamp(14px,1.5vw,22px)]
        rounded-[25px]
        px-6 py-3
        sm:px-8 sm:py-4
        md:px-10 md:py-5
        lg:px-12 lg:py-5
        xl:px-16 xl:py-6
        transition-all duration-300
        hover:shadow-header 
        hover:opacity-90
        focus:outline-none focus:shadow-header focus:ring-black
        ${className}
      `}
    >
      {children}
    </button>
  );
}
