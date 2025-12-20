import Image from 'next/image';

export default function Testing() {
  return (
    <button
      aria-label="Testing"
      //   className="
      //   hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Image src="/images/home/animali.png" alt="Testing" width={100} height={100} />
    </button>
  );
}
