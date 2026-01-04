import Image from 'next/image';

export default function Quality({ width = 100, height = 100, ariaLabel = 'Quality' }) {
  return (
    <span aria-label={ariaLabel}>
      <Image src="/images/home/qualita.png" alt={ariaLabel} width={width} height={height} />
    </span>
  );
}
