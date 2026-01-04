import Image from 'next/image';

export default function PlantBased({ width = 100, height = 100, ariaLabel = 'Plant-based' }) {
  return (
    <span aria-label={ariaLabel}>
      <Image src="/images/home/vegetali.png" alt={ariaLabel} width={width} height={height} />
    </span>
  );
}
