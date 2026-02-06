import { Icon } from '@/components/ui';

export default function Delite({ className = '' }) {
  return (
    <span aria-hidden="true" className="bg-background-gray">
      <Icon
        id="livello"
        className={`w-3 h-3 md:w-4 md:h-4 fill-current stroke-current ${className}`}
      />
    </span>
  );
}
