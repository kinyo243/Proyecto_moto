interface BrandMarkProps {
  size?: number;
  className?: string;
}

/** Isotipo de TallerMoto Pro: moto estilizada sobre tile naranja "ignición". */
export default function BrandMark({ size = 36, className = '' }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`shrink-0 drop-shadow-[0_6px_14px_rgba(238,64,8,0.35)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a37" />
          <stop offset="1" stopColor="#c52e09" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#bm-g)" />
      <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="40" r="9" />
        <circle cx="44" cy="40" r="9" />
        <path d="M20 40l9-15h10l5 15M29 25h-6" />
      </g>
    </svg>
  );
}
