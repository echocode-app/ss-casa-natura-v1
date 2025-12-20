import Image from 'next/image';

export default function Quality() {
  return (
    <button
      aria-label="Quality"
      //   className="
      //   hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Image src="/images/home/qualita.png" alt="Qualityd" width={100} height={100} />
    </button>
  );
}
