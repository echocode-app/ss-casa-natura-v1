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
        text-[clamp(12px,1.5vw,22px)]
        rounded-[25px]
        transition-all duration-300
        hover:shadow-header 
        hover:opacity-90
        focus:outline-none focus:shadow-header 
        ${className}
      `}
    >
      {children}
    </button>
  );
}
