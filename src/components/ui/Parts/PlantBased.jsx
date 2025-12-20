import Image from 'next/image';

export default function PlantBased() {
  return (
    <button
      aria-label="Plant-based"
      //   className="
      //   hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Image src="/images/home/vegetali.png" alt="Plant-based" width={100} height={100} />
    </button>
  );
}
