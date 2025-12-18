"use client";

export default function PrimaryButton({
  children,
  onClick,
  className = "",
  type = "button",
}) {
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
        px-8 sm:px-12 lg:px-16
        py-4 sm:py-5 lg:py-6
        transition-all
        hover:opacity-90
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-black
        ${className}
      `}
    >
      {children}
    </button>
  );
}
