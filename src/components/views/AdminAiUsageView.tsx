import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Users,
  Activity,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Database
} from "lucide-react";
import { useCurrencyStore } from "../../store/useCurrencyStore";

export interface UserAiMetricItem {
  email: string;
  totalGenerations: number;
  monthlyGenerations: number;
  dailyGenerations: number;
  monthlyLimit: number;
  remainingMonthly: number;
  totalBilledARS: number;
  lastActiveAt: string | null;
}

export interface AdminAiMetricsData {
  success: boolean;
  globalStats: {
    totalGenerations: number;
    tokensConsumedEstimate: number;
    lastUsedAt: string;
  };
  monthlyLimitPerUser: number;
  dailyLimitPerUser: number;
  fixedFeeARS: number;
  metrics: {
    todayGenerationsCount: number;
    monthGenerationsCount: number;
    totalBilledARS: number;
    activeUsersCount: number;
    estimatedApiCostUSD: string;
    grossProfitARS: number;
  };
  users: UserAiMetricItem[];
}

export const AdminAiUsageView: React.FC = () => {
  const { formatPrice } = useCurrencyStore();
  const [data, setData] = useState<AdminAiMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLimits, setEditingLimits] = useState(false);
  const [inputMonthlyLimit, setInputMonthlyLimit] = useState(15);
  const [inputDailyLimit, setInputDailyLimit] = useState(5);
  const [inputFixedFeeARS, setInputFixedFeeARS] = useState(3500);
  const [isSavingLimits, setIsSavingLimits] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-metrics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setInputMonthlyLimit(json.monthlyLimitPerUser || 15);
        setInputDailyLimit(json.dailyLimitPerUser || 5);
        setInputFixedFeeARS(json.fixedFeeARS || 3500);
      }
    } catch (e) {
      console.error("Error fetching AI metrics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLimits(true);
    setStatusMessage("");
    try {
      const res = await fetch("/api/admin/ai-limits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyLimit: Number(inputMonthlyLimit),
          dailyLimit: Number(inputDailyLimit),
          fixedFeeARS: Number(inputFixedFeeARS)
        })
      });
      const result = await res.json();
      if (result.success) {
        setStatusMessage("Límites y tarifa de IA actualizados correctamente.");
        setEditingLimits(false);
        await fetchMetrics();
        setTimeout(() => setStatusMessage(""), 4000);
      }
    } catch (e) {
      console.error("Error actualizando límites:", e);
      setStatusMessage("Error al guardar cambios de límites.");
    } finally {
      setIsSavingLimits(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER WITH CONTROLS */}
      <div className="p-6 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--brand-brick)]" />
            <h2 className="text-sm uppercase tracking-wider font-semibold font-heading text-[var(--text-primary)]">
              Consumo de IA & Protección de Margen
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Activo
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
            Control de cuotas de generación por usuario, monitoreo de llamadas al modelo, estadísticas de uso diario/mensual y tarifa fija de diseño para rentabilidad del taller.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingLimits(!editingLimits)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-surface-subtle)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{editingLimits ? "Cerrar Ajustes" : "Ajustar Cuotas & Tarifa"}</span>
          </button>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-primary hover:brightness-105 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* MODAL / FORM DE EDICIÓN DE LÍMITES Y TARIFA */}
      {editingLimits && (
        <form onSubmit={handleSaveLimits} className="p-5 rounded-xl bg-[var(--bg-surface)] border border-primary/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-xs font-medium font-heading uppercase text-primary tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Parámetros de Cuota de IA por Cliente
            </h3>
            <span className="text-[11px] text-[var(--text-secondary)]">Protección de cuotas & costos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Límite Mensual (por usuario):
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={inputMonthlyLimit}
                onChange={(e) => setInputMonthlyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Bloquea al alcanzar este número en el mes.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Límite Diario (por usuario):
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={inputDailyLimit}
                onChange={(e) => setInputDailyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Evita ráfagas y uso abusivo diario.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Tarifa Fija de Diseño IA (ARS):
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={inputFixedFeeARS}
                onChange={(e) => setInputFixedFeeARS(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-page)] text-xs text-[var(--text-primary)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Monto facturado por cada diseño generado.</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingLimits(false)}
              className="px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingLimits}
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium flex items-center gap-1.5"
            >
              {isSavingLimits ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[11px] font-mono uppercase">Generaciones Hoy</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-semibold font-heading text-[var(--text-primary)]">
            {data?.metrics.todayGenerationsCount ?? 0}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">Día en curso</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[11px] font-mono uppercase">Generaciones Mes</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-semibold font-heading text-[var(--text-primary)]">
            {data?.metrics.monthGenerationsCount ?? 0}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">Ciclo mensual actual</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[11px] font-mono uppercase">Facturación IA Bruta</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-semibold font-heading text-emerald-400">
            {formatPrice(data?.metrics.totalBilledARS ?? 0)}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">Tarifa fija: {formatPrice(data?.fixedFeeARS || 3500)}</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[11px] font-mono uppercase">Margen Protegido</span>
            <TrendingUp className="w-4 h-4 text-[var(--brand-brick)]" />
          </div>
          <p className="text-2xl font-semibold font-heading text-[var(--brand-brick)]">
            {formatPrice(data?.metrics.grossProfitARS ?? 0)}
          </p>
          <span className="text-[10px] text-[var(--text-secondary)]">Costo API est.: ~${data?.metrics.estimatedApiCostUSD ?? 0} USD</span>
        </div>
      </div>

      {/* AUDIT TABLE PER USER */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-medium font-heading uppercase text-[var(--text-primary)] tracking-wider">
              Consumo de IA por Usuario (Diario / Mensual)
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Auditoría granular de cupos asignados, saldo consumido y estado de bloqueo preventivo.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-secondary)]">
            <span>Usuarios activos: <strong>{data?.metrics.activeUsersCount ?? 0}</strong></span>
            <span>·</span>
            <span>Total consultas históricas: <strong>{data?.globalStats.totalGenerations ?? 0}</strong></span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span>Cargando auditoría de usuarios...</span>
          </div>
        ) : !data?.users || data.users.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
            No hay registros de consumo de IA por el momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] font-medium">
                  <th className="py-3 px-4">Usuario / Email</th>
                  <th className="py-3 px-4 text-center">Uso Diario</th>
                  <th className="py-3 px-4 text-center">Uso Mensual</th>
                  <th className="py-3 px-4 text-center">Cupo Restante</th>
                  <th className="py-3 px-4 text-right">Total Facturado</th>
                  <th className="py-3 px-4 text-center">Estado de Bloqueo</th>
                  <th className="py-3 px-4">Última Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {data.users.map((u) => {
                  const isBlocked = u.monthlyGenerations >= u.monthlyLimit || u.dailyGenerations >= (data.dailyLimitPerUser || 5);
                  return (
                    <tr key={u.email} className="hover:bg-[var(--bg-surface-subtle)]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                        {u.email}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded ${u.dailyGenerations >= (data.dailyLimitPerUser || 5) ? 'bg-red-500/20 text-red-400 font-bold' : 'text-[var(--text-secondary)]'}`}>
                          {u.dailyGenerations} / {data.dailyLimitPerUser || 5}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded ${u.monthlyGenerations >= u.monthlyLimit ? 'bg-red-500/20 text-red-400 font-bold' : 'text-[var(--text-secondary)]'}`}>
                          {u.monthlyGenerations} / {u.monthlyLimit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                        {u.remainingMonthly}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--text-primary)]">
                        {formatPrice(u.totalBilledARS)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Bloqueado (Cupo Excedido)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Habilitado</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] font-mono text-[var(--text-secondary)] whitespace-nowrap">
                        {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "Sin actividad reciente"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
