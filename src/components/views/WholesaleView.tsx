import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Send,
  Building,
  Truck,
  Users,
  Calculator,
} from "lucide-react";
import { WHOLESALE_TIERS } from "../../data/materials";

interface WholesaleViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const WholesaleView: React.FC<WholesaleViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [projectedM2, setProjectedM2] = useState<number>(350);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    cuit: "",
    city: "",
    email: "",
    phone: "",
    notes: "",
  });

  let activeTier = WHOLESALE_TIERS[0];
  if (projectedM2 >= 1000) {
    activeTier = WHOLESALE_TIERS[2];
  } else if (projectedM2 >= 500) {
    activeTier = WHOLESALE_TIERS[1];
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="section-container pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-44 space-y-12 sm:space-y-16 max-w-6xl">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-primary font-medium">
          Canal Mayorista & Gremio
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
          {t("wholesale_title")}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {t("wholesale_subtitle")}
        </p>
      </div>

      {/* TIERS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WHOLESALE_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`p-6 sm:p-8 rounded-[7px] border transition-all flex flex-col justify-between ${
              tier.highlight
                ? "border-primary bg-[var(--bg-surface-subtle)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base text-[var(--text-primary)] font-medium">
                  {tier.name}
                </h3>
                {tier.highlight && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-[7px] bg-accent text-black font-medium">
                    Más elegido
                  </span>
                )}
              </div>
              <div>
                <span className="font-heading text-4xl text-primary font-mono-num font-medium">
                  {tier.discountPercent}% OFF
                </span>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  A partir de {tier.minMonthlyM2} m² mensuales
                </p>
              </div>
              <ul className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                {tier.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE TIER SIMULATOR */}
      <div className="p-6 sm:p-8 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-primary font-medium">
            Simulador de Escala Mensual
          </span>
          <h2 className="font-heading text-2xl text-[var(--text-primary)]">
            Calculá el beneficio según los m² de tu taller
          </h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">
              Metros cuadrados proyectados por mes:
            </span>
            <span className="font-mono-num text-[var(--text-primary)] text-xl font-medium">
              {projectedM2} m²
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={projectedM2}
            onChange={(e) => setProjectedM2(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-[7px] accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono-num">
            <span>50 m²</span>
            <span>200 m² (Inicio)</span>
            <span>500 m² (Agencia)</span>
            <span>1.000+ m² (Partner)</span>
          </div>
        </div>
        <div className="p-4 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-[var(--text-secondary)]">Escala alcanzada:</span>
            <p className="text-[var(--text-primary)] text-sm font-medium">
              {activeTier.name} — Descuento del {activeTier.discountPercent}% directo en servidor
            </p>
          </div>
          <button
            onClick={() => {
              const element = document.getElementById("b2b-form");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-5 py-2.5 rounded-[7px] bg-primary text-white text-xs transition-colors shrink-0 font-medium"
          >
            Solicitar esta escala
          </button>
        </div>
      </div>

      {/* B2B APPLICATION FORM */}
      <div
        id="b2b-form"
        className="max-w-2xl mx-auto p-6 sm:p-8 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6"
      >
        <div className="space-y-1 text-center">
          <h3 className="font-heading text-xl text-[var(--text-primary)] font-medium">
            Solicitud de Cuenta Gremio
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Completá tus datos comerciales. Un asesor técnico verificará tu CUIT en 24 horas hábiles.
          </p>
        </div>
        {submitted ? (
          <div className="p-6 rounded-[7px] bg-[var(--bg-surface-subtle)] border border-primary/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
            <h4 className="font-heading text-sm text-[var(--text-primary)] font-medium">
              ¡Solicitud enviada con éxito!
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Te contactaremos al correo ingresado para habilitar las listas de precios mayoristas en tu perfil.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)]">Razón Social / Taller</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Imprenta San Martín SRL"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full min-h-[2.75rem] px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)]">CUIT</label>
                <input
                  type="text"
                  required
                  placeholder="30-XXXXXXXX-X"
                  value={formData.cuit}
                  onChange={(e) =>
                    setFormData({ ...formData, cuit: e.target.value })
                  }
                  className="w-full min-h-[2.75rem] px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)]">Localidad / Provincia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Rosario, Santa Fe"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full min-h-[2.75rem] px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)]">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 ..."
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full min-h-[2.75rem] px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)]">Email Corporativo</label>
              <input
                type="email"
                required
                placeholder="compras@taller.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full min-h-[2.75rem] px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[var(--text-secondary)]">
                Detalle de consumo / Comentarios
              </label>
              <textarea
                rows={3}
                placeholder="Mencioná tipos de materiales habituales (lonas front, microperforado, placas)..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-[7px] border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-primary)]"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[2.75rem] py-3.5 rounded-[7px] bg-primary text-white text-xs transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
              <span>Enviar solicitud de cuenta gremio</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
