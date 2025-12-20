import Image from 'next/image';

export default function Arrow({ className = '' }) {
  return (
    <button aria-label="Arrow" className={`transition-transform duration-400 ${className}`}>
      <Image src="/images/parts/arc.svg" alt="Arrow" width={200} height={70} />
    </button>
  );
}
