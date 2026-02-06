import { Icon } from '@/components/ui';

export default function CartIcons() {
  return (
    <span
      aria-hidden="true"
      className="py-[20px] hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Icon id="menu" className="w-5 h-5 sm:w-6 sm:h-6" />
    </span>
  );
}
