import { Icon } from '@/components/ui';

export default function CartIcons() {
  return (
    <button
      aria-label="Search"
      className="py-[20px] hover:scale-105 focus:scale-105 transition-transform duration-400"
    >
      <Icon id="search" className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}
