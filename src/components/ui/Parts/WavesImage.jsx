export default function WavesImage({ className = '' }) {
  return (
    <div
      aria-hidden
      className={`
        absolute inset-0
        pointer-events-none overflow-hidden
        ${className}
      `}
    >
      {/* WAVE BACKGROUND */}
      <div
        className="
          absolute top-0 left-0
          w-full
          h-full
          bg-no-repeat
          bg-top
          bg-cover
        "
        style={{
          backgroundImage: "url('/images/parts/wave.svg')",
        }}
      />
    </div>
  );
}
