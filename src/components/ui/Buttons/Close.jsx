import { Icon } from '@/components/ui';

export default function Close() {
  return (
    <span
      aria-label="Close"
      className="py-[20px] px-[20px] hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Icon id="close" className="w-5 h-5 sm:w-6 sm:h-6" />
    </span>
  );
}
