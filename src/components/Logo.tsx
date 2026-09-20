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
    <span className={`inline-flex items-baseline tracking-tight select-none font-logo ${sizeClasses[size]} ${className}`}>
      <span className="font-bold text-[var(--text-primary)] transition-colors">
        Carteles.
      </span>
      <span className="font-black text-primary transition-colors">
        Click
      </span>
    </span>
  );
};

export default Logo;
