import Image from 'next/image';

export default function Testing() {
  return (
    <span aria-label="Testing">
      <Image src="/images/home/animali.png" alt="Testing" width={100} height={100} />
    </span>
  );
}
