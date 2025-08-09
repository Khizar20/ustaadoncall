import React from "react";

interface BrandLogoProps {
  className?: string;
}

// Simple, brand-relevant logo: chat bubble + tool inside a light disc for visibility
const BrandLogo: React.FC<BrandLogoProps> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="UstaadOnCall logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="uocDisc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F7F1E8" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="30" fill="url(#uocDisc)" />

      {/* Chat bubble */}
      <path
        d="M18 22h28a8 8 0 0 1 0 16H34l-8 6v-6h-8a8 8 0 0 1 0-16z"
        fill="#CC6E37"
      />

      {/* Minimal wrench/tool mark inside bubble */}
      <g transform="translate(0,2)">
        <path d="M40 28l-3 3 6 6 3-3-6-6z" fill="#FFFFFF" />
        <path d="M35 33l-2 2 4 4 2-2-4-4z" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

export default BrandLogo;


