import Image from 'next/image';

export default function GreenPlanet() {
  return (
    <span
      aria-label="Green Planet"
      className="inline-block animate-planet hover:[animation-play-state:paused]"
    >
      <Image src="/images/home/earth.png" alt="Green Planet" width={500} height={500} priority />
    </span>
  );
}
