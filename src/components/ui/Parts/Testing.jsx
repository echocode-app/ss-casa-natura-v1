import Image from 'next/image';

export default function Testing({ width = 100, height = 100, ariaLabel = 'Testing' }) {
  return (
    <span aria-label={ariaLabel}>
      <Image src="/images/home/animali.png" alt={ariaLabel} width={width} height={height} />
    </span>
  );
}
