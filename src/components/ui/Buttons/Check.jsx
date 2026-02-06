import { Icon } from '@/components/ui';

export default function Check({ className = '' }) {
  return (
    <span aria-hidden="true">
      <Icon id="checking" className={`w-5 h-5 lg:w-10 lg:h-10 ${className}`.trim()} />
    </span>
  );
}
