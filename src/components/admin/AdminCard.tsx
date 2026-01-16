export default function AdminCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        bg-white/80 backdrop-blur
        rounded-[24px]
        shadow-header
        border border-black/5
        ${className}
      `}
    >
      {children}
    </div>
  );
}
