export default function Icon({
  id,
  className = '',
  width = 24,
  height = 24,
  'aria-hidden': ariaHidden = true,
}) {
  if (!id) return null;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      aria-hidden={ariaHidden}
      focusable="false"
    >
      <use href={`/icons/sprite.svg#${id}`} />
    </svg>
  );
}
