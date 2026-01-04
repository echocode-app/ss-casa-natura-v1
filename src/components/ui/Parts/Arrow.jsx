import Image from 'next/image';

export default function Arrow({ className = '', ariaLabel = 'Arrow' }) {
  return (
    <button aria-label={ariaLabel} className={`transition-transform duration-400 ${className}`}>
      <Image src="/images/parts/arc.svg" alt={ariaLabel} width={200} height={70} />
    </button>
  );
}
