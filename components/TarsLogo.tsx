"use client";

interface TarsLogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  variant?: "light" | "dark";
}

export function TarsLogo({ className = "", iconSize = 40, showText = true, variant = "dark" }: TarsLogoProps) {
  const textColor = variant === "dark" ? "text-white" : "text-[#6A2FBC]";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Rounded square background - deep purple */}
        <rect
          width="48"
          height="48"
          rx="10"
          fill="#6A2FBC"
        />
        {/* Top line - short, white */}
        <rect
          x="10"
          y="12"
          width="14"
          height="6"
          rx="3"
          fill="white"
          filter="url(#shadow)"
        />
        {/* Middle line - longer, white */}
        <rect
          x="10"
          y="21"
          width="22"
          height="6"
          rx="3"
          fill="white"
          filter="url(#shadow)"
        />
        {/* Bottom line - short, lime green */}
        <rect
          x="10"
          y="30"
          width="14"
          height="6"
          rx="3"
          fill="#A7F0A7"
          filter="url(#shadow)"
        />
        <defs>
          <filter id="shadow" x="-2" y="-2" width="60" height="60">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#4a1d8a" floodOpacity="0.5" />
          </filter>
        </defs>
      </svg>
      {showText && (
        <span className={`text-xl font-bold tracking-wide ${textColor}`}>
          TARS
        </span>
      )}
    </div>
  );
}
