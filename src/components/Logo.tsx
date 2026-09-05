import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  return (
    <span
      className={`inline-flex items-baseline tracking-tight select-none ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: "var(--font-logo)",
      }}
    >
      <span
        className="font-bold text-[#2C2C2C] dark:text-white transition-colors"
        style={{
          fontFamily: "var(--font-logo)",
          fontWeight: 700,
        }}
      >
        Carteles.
      </span>
      <span
        className="font-black transition-colors"
        style={{
          fontFamily: "var(--font-logo)",
          fontWeight: 900,
          color: "#EE7828",
        }}
      >
        Click
      </span>
    </span>
  );
};

export default Logo;
