'use client';

export default function Spinner({ size = 'md', colorScheme = 'accent', className = '' }) {
  const sizes = {
    sm: 'w-10 h-10 border-2',
    md: 'w-16 h-16 border-2',
    lg: 'w-24 h-24 border-[3px]',
    xl: 'w-32 h-32 border-4',
  };

  const colors = {
    accent: 'border-t-[#FFFC8A] border-[#FFFC8A]/80',
    light: 'border-t-[#F9F8D6] border-[#F9F8D6]/80',
    muted: 'border-t-[#767676] border-[#767676]/80',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full
        animate-spin
        ${colors[colorScheme]}
        ${className}
      `}
      aria-label="Loading"
    />
  );
}
