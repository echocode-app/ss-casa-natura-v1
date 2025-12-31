'use client';

export default function ProductBadge({ text = '', color = 'bg-green-500', className = '' }) {
  if (!text) return null;

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold uppercase text-white rounded-full ${color} ${className}`}
    >
      {text}
    </span>
  );
}
