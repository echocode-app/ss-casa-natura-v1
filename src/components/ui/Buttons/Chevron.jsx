import { Icon } from '@/components/ui';

export default function Chevron({ className = '' }) {
  return (
    <span aria-hidden="true" className="text-black">
      <Icon id="chevron-down" className={`w-6 h-3 fill-current stroke-current ${className}`} />
    </span>
  );
}
