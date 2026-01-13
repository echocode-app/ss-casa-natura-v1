'use client';

export default function Spinner({ size = 'md', colorScheme = 'accent', className = '' }) {
  const sizes = {
    sm: 'w-3 h-3 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-4',
  };

  const colors = {
    accent: 'border-t-[#FFFC8A] border-[#FFFC8A]/80 border-gray-200',
    light: 'border-t-[#F9F8D6] border-[#F9F8D6]/80 border-gray-200',
    muted: 'border-t-[#767676] border-[#767676]/80 border-gray-200',
  };

  return (
    <div
      className={`${sizes[size]} ${colors[colorScheme]} rounded-full animate-spin mx-auto ${className}`}
      aria-label="Loading"
    />
  );
}
