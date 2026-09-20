import React, { useState } from "react";
import { Download, Share, PlusSquare, X, CheckCircle, Smartphone } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, canPromptNative, installPWA } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (canPromptNative) {
      const installed = await installPWA();
      if (installed) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
          aria-label="Cerrar modal de instalación"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 id="pwa-install-title" className="text-base font-bold font-heading text-[var(--text-primary)]">
              Instalar Carteles.Click
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Experiencia nativa en tu dispositivo móvil o desktop
            </p>
          </div>
        </div>

        {installSuccess || isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">¡Aplicación instalada exitosamente!</span>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 bg-[var(--bg-surface-subtle)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              Para instalar en iPhone o iPad (iOS Safari):
            </div>
            <ol className="text-xs text-[var(--text-secondary)] space-y-2 list-decimal list-inside">
              <li className="flex items-center gap-2">
                <span>1. Toca el botón <strong>Compartir</strong></span>
                <Share className="w-4 h-4 text-primary inline" />
              </li>
              <li className="flex items-center gap-2">
                <span>2. Desplázate hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong></span>
                <PlusSquare className="w-4 h-4 text-primary inline" />
              </li>
              <li>
                <span>3. Confirma tocando <strong>Agregar</strong> en la esquina superior derecha.</span>
              </li>
            </ol>
          </div>
        ) : canPromptNative ? (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Instala Carteles.Click en tu pantalla de inicio para cotizar sin conexión, recibir actualizaciones de taller y acceder en un toque.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Instalar Aplicación Nativa
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Para instalar esta app, puedes usar el menú de tu navegador y seleccionar <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
