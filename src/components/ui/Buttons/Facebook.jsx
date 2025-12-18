import Image from 'next/image';

export default function Facebook() {
  return (
    <button
      aria-label="Facebook"
      className="py-[20px] hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Image src="/images/parts/facebook.svg" alt="Facebook" width={24} height={24} />
    </button>
  );
}
