import Image from 'next/image';

export default function Arrow({ className = '' }) {
  return (
    <span aria-hidden="true" className={`transition-transform duration-400 ${className}`}>
      <Image src="/images/parts/arc.svg" alt="" width={200} height={70} />
    </span>
  );
}
