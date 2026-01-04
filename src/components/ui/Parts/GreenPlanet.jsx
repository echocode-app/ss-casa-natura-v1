import Image from 'next/image';

export default function GreenPlanet({ width = 500, height = 500, ariaLabel = 'Green Planet' }) {
  return (
    <span
      aria-label={ariaLabel}
      className="inline-block animate-planet md:hover:[animation-play-state:paused]"
    >
      <Image src="/images/home/earth.png" alt={ariaLabel} width={width} height={height} priority />
    </span>
  );
}
