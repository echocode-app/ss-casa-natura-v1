export default function GreenBackground({ className = '' }) {
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

      {/* GREENSWARD */}
      <div
        className="
          absolute bottom-0 left-0
          w-full
          h-[300px] md:h-[350px]
          bg-repeat-x
          bg-bottom
        "
        style={{
          backgroundImage: "url('/images/home/greensward.png')",
          backgroundSize: 'auto 100%',
        }}
      />
    </div>
  );
}
