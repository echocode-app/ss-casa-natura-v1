import Image from 'next/image';

export default function GreenPlanet() {
  return (
    <span
      aria-label="Green Planet"
      //   className="
      //   hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Image src="/images/home/earth.png" alt="Green Planet" width={500} height={500} />
    </span>
  );
}
