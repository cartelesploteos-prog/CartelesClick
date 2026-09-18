import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, Clock, DollarSign, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";

export interface UserAiChargeRecord {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  costARS: number;
  promptTopic: string;
  headlineGenerated: string;
  status: "completado" | "facturado" | "pendiente";
}

export const AiUsageChargesTable: React.FC<{ onNavigate?: (view: string, param?: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const [history, setHistory] = useState<UserAiChargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBilledARS, setTotalBilledARS] = useState(0);
  const [fixedFeeARS, setFixedFeeARS] = useState(3500);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const email = user?.email || "carteles.ploteos@gmail.com";
      const res = await fetch(`/api/ai/user-history?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.history) {
          setHistory(data.history);
          setTotalBilledARS(data.totalChargesARS || 0);
          setFixedFeeARS(data.fixedFeeARS || 3500);
        }
      }
    } catch (e) {
      console.error("Error cargando historial de cargos de IA:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.email]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Resumen de Política de Cobro y Tarifa Fija */}
      <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[var(--brand-brick)]/10 text-[var(--brand-brick)] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Historial de Diseños Generados con IA (Póster Creator)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tarifa Fija: {formatPrice(fixedFeeARS)} / generación
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
              Cada propuesta redactada y diagramada con el asistente de IA en Carteles.Click cuenta con un cargo fijo transparente debitado de tu cuenta para garantizar el mantenimiento de modelos e infraestructura técnica de taller.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
            title="Refrescar historial de cargos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate("poster_creator")}
              className="px-4 py-2 rounded-lg bg-[var(--brand-brick)] hover:brightness-105 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nuevo Diseño IA</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Diseños Realizados</span>
          <p className="text-xl font-semibold font-heading text-[var(--text-primary)]">{history.length}</p>
          <span className="text-[10px] text-[var(--text-secondary)]">Generaciones registradas en tu cuenta</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Total Facturado / Cargos</span>
          <p className="text-xl font-semibold font-heading text-primary">{formatPrice(totalBilledARS)}</p>
          <span className="text-[10px] text-[var(--text-secondary)]">Monto acumulado deducible</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1">
          <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">Tarifa Vigente por Consulta</span>
          <p className="text-xl font-semibold font-heading text-emerald-400">{formatPrice(fixedFeeARS)}</p>
          <span className="text-[10px] text-[var(--text-secondary)]">Precio fijado por la administración</span>
        </div>
      </div>

      {/* Tabla Desglosada */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-medium font-heading text-[var(--text-primary)] uppercase tracking-wider">
              Desglose Cronológico de Transacciones IA
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Auditoría de titulares generados, costo unitario en ARS y fecha exacta.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">
            Usuario: {user?.email || "carteles.ploteos@gmail.com"}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span>Consultando registro de cargos con el servidor...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Aún no registrás cargos de generación de pósters con IA.
            </p>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              Cuando uses el asistente creativo en el Póster Creator, cada diseño redactado aparecerá aquí con su costo y estado de cobro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] font-medium">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Rubro / Tema del Póster</th>
                  <th className="py-3 px-4">Titular Generado</th>
                  <th className="py-3 px-4 text-right">Costo Fijo</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {history.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[var(--bg-surface-subtle)]/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(rec.timestamp).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      {rec.promptTopic || "Diseño asistido"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--brand-brick)] max-w-xs truncate" title={rec.headlineGenerated}>
                      {rec.headlineGenerated}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[var(--text-primary)] whitespace-nowrap">
                      {formatPrice(rec.costARS || fixedFeeARS)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{rec.status === "facturado" ? "Facturado" : "Completado"}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
