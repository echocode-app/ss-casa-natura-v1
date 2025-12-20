export default function WaveBackground({ color = '#F9F8D6', className = '' }) {
  return (
    <div
      className={`
        absolute inset-0 z-0 pointer-events-none overflow-hidden
        ${className}
      `}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="hidden md:block absolute top-0 left-0 w-full h-full"
      >
        <path
          d="
            M0,340
            C100,120 600,300 200,300
            C200,80 900,200 460,200
            C800,-200 1300,200 1100,140
            C1100,90 1300,100 1440,200
            L1440,900
            L0,900
            Z
          "
          fill={color}
        />
      </svg>
    </div>
  );
}
