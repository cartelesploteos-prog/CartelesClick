import * as React from "react";
import { type Transition } from "motion/react";

export interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  initialOffset?: number;
  transition?: Transition;
  style?: React.CSSProperties;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = "",
  duration = 3.5,
  borderWidth = 2,
  colorFrom = "#FFFFFF",
  colorTo = "#FFFFFF",
  delay = 0,
  style,
}) => {
  const durationVal = typeof duration === "number" ? `${duration}s` : duration || "3.5s";
  const borderWidthVal = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth || "2px";
  const colorFromVal = colorFrom || "#FFFFFF";
  const colorToVal = colorTo || "#FFFFFF";

  return (
    <div
      aria-hidden="true"
      style={
        {
          "--duration": durationVal,
          "--border-width": borderWidthVal,
          "--color-from": colorFromVal,
          "--color-to": colorToVal,
          "--delay": `-${delay}s`,
          ...style,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden ${className}`}
    >
      <div 
        className="absolute inset-0 rounded-[inherit]"
        style={{
          border: 'var(--border-width) solid transparent',
          background: 'transparent',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0) border-box',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0) border-box',
          maskComposite: 'exclude',
        }}
      >
        <div 
          className="absolute left-1/2 top-1/2 aspect-square opacity-100"
          style={{
            width: '300%',
            animation: 'border-beam-spin var(--duration) linear infinite',
            animationDelay: 'var(--delay)',
            background: 'conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 70%, var(--color-from) 85%, var(--color-to) 100%)',
          }}
        />
      </div>
    </div>
  );
};

export default BorderBeam;
