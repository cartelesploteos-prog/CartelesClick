import React from "react";
import { motion } from "motion/react";
import {
  Zap,
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
  ArrowUpRight,
  MapPin,
  MessageCircle,
  FileCheck,
  Lock,
} from "lucide-react";
import { Logo } from "./Logo";
import { MATERIALS_CATALOG, DICTIONARY_TERMS } from "../data/materials";
import { useParallaxScroll } from "../hooks/useParallaxScroll";
import { APP_VERSION } from "../config/version";
import { useTranslation } from "react-i18next";
import { IconBadge } from "./ui/IconBadge";

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { footerY, footerOpacity } = useParallaxScroll();

  return (
    <motion.footer
      id="footer"
      style={{ y: footerY, opacity: footerOpacity }}
      className="bg-[var(--bg-surface)] text-[var(--text-primary)] border-t border-[var(--border-subtle)] transition-colors overflow-hidden"
    >
      {/* 1. TRUST PILLARS TOP BANNER (FLEXBOX AUTO-LAYOUT) */}
      <div className="border-b border-[var(--border-subtle)] py-[var(--space-md)]">
        <div className="section-container flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          
          <div className="flex-auto min-w-[220px] max-w-[300px] flex items-center gap-3">
            <IconBadge
              icon={ShieldCheck}
              size="md"
              variant="primary"
              containerStyle="subtle"
              className="shrink-0"
            />
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm leading-snug">
                Cotización Transparente
              </h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Precios finales de fábrica en $ ARS.
              </p>
            </div>
          </div>

          <div className="flex-auto min-w-[220px] max-w-[300px] flex items-center gap-3">
            <IconBadge
              icon={Sparkles}
              size="md"
              variant="accent"
              containerStyle="subtle"
              className="shrink-0"
            />
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm leading-snug">
                Diseño Asistido por IA
              </h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Generación y remezcla de artes 1440 DPI.
              </p>
            </div>
          </div>

          <div className="flex-auto min-w-[220px] max-w-[300px] flex items-center gap-3">
            <IconBadge
              icon={Clock}
              size="md"
              variant="primary"
              containerStyle="subtle"
              className="shrink-0"
            />
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm leading-snug">
                {t("prod_24hs")}
              </h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                {t("prod_24hs_sub")}
              </p>
            </div>
          </div>

          <div className="flex-auto min-w-[220px] max-w-[300px] flex items-center gap-3">
            <IconBadge
              icon={Truck}
              size="md"
              variant="primary"
              containerStyle="subtle"
              className="shrink-0"
            />
            <div>
              <h4 className="text-[var(--text-primary)] font-semibold text-xs sm:text-sm leading-snug">
                {t("national_shipping")}
              </h4>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                {t("national_shipping_sub")}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT (FLEXBOX AUTO-LAYOUT ARCHITECTURE) */}
      <div className="section-container py-[var(--space-xl)] flex flex-wrap items-start justify-between gap-x-8 gap-y-12">
        
        {/* BRAND & LOGISTICS NOTICE BLOCK */}
        <div className="flex-auto min-w-[280px] max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
              <Zap className="w-5 h-5 fill-current text-white" strokeWidth={1.85} />
            </div>
            <Logo size="md" />
          </div>

          <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
            Plataforma digital de cotización instantánea por m², generación asistida de pósters con IA y manufactura industrial de cartelería publicitaria.
          </p>

          <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)] text-xs">
              <Truck className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.85} />
              <span>Aviso de Logística a Despacho:</span>
            </div>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
              El cargo de $4.000 ARS cubre embalaje técnico reforzado y traslado hasta expreso/terminal. El flete se abona a la empresa de transporte en destino.
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS FLEX AUTO-LAYOUT */}
        <div className="flex-auto min-w-[300px] flex flex-wrap items-start justify-between gap-x-6 gap-y-8">
          
          {/* MATERIALES DESTACADOS */}
          <div className="flex-auto min-w-[130px] max-w-[180px]">
            <h4 className="text-[var(--text-primary)] font-semibold text-xs uppercase tracking-wider mb-3.5">
              Materiales
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              {MATERIALS_CATALOG.slice(0, 6).map((mat) => (
                <li key={mat.id}>
                  <button
                    onClick={() => onNavigate("material-detail", mat.id)}
                    className="hover:text-primary transition-colors text-left flex items-center gap-1 cursor-pointer"
                  >
                    <span>{mat.name.split("(")[0]}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate("materiales")}
                  className="hover:text-primary transition-colors hover:underline pt-1 flex items-center gap-1 cursor-pointer font-medium text-primary"
                >
                  <span>Ver catálogo completo</span>
                  <ArrowUpRight className="w-3 h-3" strokeWidth={1.85} />
                </button>
              </li>
            </ul>
          </div>

          {/* DICCIONARIO TÉCNICO */}
          <div className="flex-auto min-w-[130px] max-w-[180px]">
            <h4 className="text-[var(--text-primary)] font-semibold text-xs uppercase tracking-wider mb-3.5">
              Glosario Técnico
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              {DICTIONARY_TERMS.slice(0, 5).map((term) => (
                <li key={term.slug}>
                  <button
                    onClick={() => onNavigate("diccionario", term.slug)}
                    className="hover:text-primary transition-colors text-left cursor-pointer"
                  >
                    {term.term.split("(")[0]}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate("diccionario")}
                  className="hover:text-primary transition-colors hover:underline pt-1 flex items-center gap-1 cursor-pointer font-medium text-primary"
                >
                  <span>Glosario completo</span>
                  <ArrowUpRight className="w-3 h-3" strokeWidth={1.85} />
                </button>
              </li>
            </ul>
          </div>

          {/* PLATAFORMA Y HERRAMIENTAS */}
          <div className="flex-auto min-w-[130px] max-w-[180px]">
            <h4 className="text-[var(--text-primary)] font-semibold text-xs uppercase tracking-wider mb-3.5">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li>
                <button
                  onClick={() => onNavigate("cotizador")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Cotizador en Vivo 24/7
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("poster")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Póster Creator (IA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("mayoristas")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Cuenta Gremio & B2B
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("portfolio")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Trabajos Realizados
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("pedidos")}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Seguimiento de Pedidos
                </button>
              </li>
            </ul>
          </div>

          {/* CONTACTO Y UBICACIÓN TÉCNICA */}
          <div className="flex-auto min-w-[150px] max-w-[210px] space-y-3">
            <h4 className="text-[var(--text-primary)] font-semibold text-xs uppercase tracking-wider mb-3.5">
              Taller Central
            </h4>
            <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" strokeWidth={1.85} />
                <span>Palermo, CABA · Producción industrial</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" strokeWidth={1.85} />
                <span>Lunes a Viernes 08:30 a 18:30 hs</span>
              </div>
              <div className="pt-1">
                <a
                  href="https://wa.me/5491148921100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-primary hover:text-primary transition-colors cursor-pointer text-xs font-medium"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.85} />
                  <span>Atención WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM LEGAL BAR (FLEXBOX AUTO-LAYOUT) */}
      <div className="border-t border-[var(--border-subtle)] py-6 text-xs text-[var(--text-secondary)]">
        <div className="section-container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span>© 2026 Carteles.Click — {t("digital_printing")}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)]">
              v{APP_VERSION.semver} (epoch:{APP_VERSION.epoch})
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.85} />
              <span>{t("payments_processed")}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-primary" strokeWidth={1.85} />
              <span>Seguridad SSL 256-bit</span>
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

