import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key and scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop with subtle blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] animate-in zoom-in-95 fade-in z-10`}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1">
            {title && (
              <h2
                id="modal-title"
                className="font-heading text-lg font-bold text-[var(--text-primary)]"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="text-xs text-[var(--text-secondary)] font-sans"
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="min-h-[2.25rem] min-w-[2.25rem] p-1.5 rounded-[7px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors focus-visible:ring-2 focus-visible:ring-primary flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="pt-4 font-sans text-sm text-[var(--text-primary)]">{children}</div>
      </div>
    </div>,
    document.body
  );
};
