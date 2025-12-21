import Image from 'next/image';

export default function Greensward() {
  return (
    <span aria-label="Greensward">
      <Image src="/images/home/greensward.png" alt="Greensward" width={360} height={360} />
    </span>
  );
}
