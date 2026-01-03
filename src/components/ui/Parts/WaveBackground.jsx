export default function WaveBackground({ color = '#F9F8D6', className = '' }) {
  return (
    <div
      aria-hidden
      className={`
        absolute inset-0
        pointer-events-none overflow-hidden z-0
        ${className}
      `}
    >
      <svg
        viewBox="0 0 1800 1000"
        preserveAspectRatio="xMidYMin slice"
        className="absolute top-0 left-0 w-full h-full"
      >
        {/* TOP CLOUD SHAPE */}
        <path
          d="
            M1845 790.861
            H1931.5
            H2049
            L1966 629.5
            C1966 629.5 1871.5 469 1739.26 417.351
            C1754.95 324.619 1712.95 231.827 1631.98 180.272
            C1543.76 124.102 1424.93 126.848 1336.97 187.844
            C1234.63 48.7162 1056.04 -22.3863 881.003 6.27189
            C696.602 36.4384 549.031 171.916 510.887 346.731
            C448.778 309.657 370.212 308.631 309.74 344.197
            C241.344 384.44 208.108 464.441 229.281 540.913
            C103.268 553.131 25.023 678.913 0 790.861
            H1845
            Z
          "
          fill={color}
        />

        {/* INFINITE FILL DOWN */}
        <rect x="0" y="790" width="2049" height="1000" fill={color} />
      </svg>
    </div>
  );
}
