interface IconProps {
  id: string;
  className?: string;
  width?: number;
  height?: number;
  ariaHidden?: boolean;
}

export default function Icon({
  id,
  className = '',
  width = 24,
  height = 24,
  ariaHidden = true,
}: IconProps) {
  if (!id) return null;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      aria-hidden={ariaHidden ? 'true' : 'false'}
      focusable={false}
    >
      <use href={`/icons/sprite.svg#${id}`} />
    </svg>
  );
}
