import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "interactive";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-[var(--bg-surface)] border-[var(--border-subtle)]",
      subtle: "bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)]",
      interactive:
        "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-primary transition-colors cursor-pointer",
    };

    return (
      <div
        ref={ref}
        className={`rounded-[7px] border p-4 sm:p-6 text-[var(--text-primary)] transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 pb-4 border-b border-[var(--border-subtle)] ${className}`}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`font-heading text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-xs sm:text-sm text-[var(--text-secondary)] font-sans ${className}`}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`pt-4 font-sans ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center pt-4 border-t border-[var(--border-subtle)] font-sans ${className}`}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
