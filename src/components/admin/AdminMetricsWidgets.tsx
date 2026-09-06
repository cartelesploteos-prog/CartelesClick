import React, { useMemo } from "react";
import { 
  TrendingUp, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  BarChart3, 
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Order } from "../../types";

interface AdminMetricsWidgetsProps {
  orders: Order[];
}

export const AdminMetricsWidgets: React.FC<AdminMetricsWidgetsProps> = ({ orders }) => {
  // =========================================================================
  // 📊 KPIS COMPUTATION
  // =========================================================================
  const metrics = useMemo(() => {
    const totalOrdersCount = orders.length;
    
    // Total Billing (ARS)
    const totalRevenue = orders.reduce((sum, o) => {
      const amount = Number(o.totalAmountARS) || 0;
      return sum + amount;
    }, 0);

    // Completed or In-Flight Orders
    const completedOrders = orders.filter(
      (o) => o.status === "entregado" || o.status === "despachado"
    ).length;

    const inProductionOrders = orders.filter(
      (o) => o.status === "en_produccion" || o.status === "terminaciones" || (o.status as string) === "impresion"
    ).length;

    const pendingOrders = orders.filter(
      (o) => o.status === "pendiente" || !o.status
    ).length;

    // Conversion rate: Completed orders relative to total (or active pipeline)
    const conversionRate = totalOrdersCount > 0 
      ? Math.round(((completedOrders + inProductionOrders) / totalOrdersCount) * 100) 
      : 0;

    // Average Ticket
    const averageTicket = totalOrdersCount > 0 
      ? Math.round(totalRevenue / totalOrdersCount) 
      : 0;

    // Monthly Volume Grouping (Last 6 months or based on order dates)
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthlyMap: Record<string, { month: string; orders: number; revenue: number; rate: number }> = {};

    // Initialize recent months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      monthlyMap[key] = { month: label, orders: 0, revenue: 0, rate: 0 };
    }

    orders.forEach((o) => {
      const date = o.createdAt ? new Date(o.createdAt) : new Date();
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyMap[key]) {
        monthlyMap[key].orders += 1;
        monthlyMap[key].revenue += Number(o.totalAmountARS) || 0;
      }
    });

    const monthlyData = Object.values(monthlyMap);

    // Pipeline Distribution
    const pipelineData = [
      { name: "Pendientes", count: pendingOrders, fill: "#F59E0B" },
      { name: "En Producción", count: inProductionOrders, fill: "#3B82F6" },
      { name: "Terminados/Despachados", count: completedOrders, fill: "#10B981" },
    ];

    return {
      totalOrdersCount,
      totalRevenue,
      completedOrders,
      inProductionOrders,
      pendingOrders,
      conversionRate,
      averageTicket,
      monthlyData,
      pipelineData,
    };
  }, [orders]);

  const formatARS = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CARD 1: TOTAL VOLUME */}
        <div className="p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
              Volumen de Pedidos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-semibold text-[var(--text-primary)]">
                {metrics.totalOrdersCount}
              </span>
              <span className="text-xs text-emerald-500 font-medium flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                <span>Activos</span>
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              {metrics.inProductionOrders} en taller · {metrics.pendingOrders} en espera
            </span>
          </div>
          <div className="w-10 h-10 rounded-[7px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* CARD 2: CONVERSION / COMPLETION RATE */}
        <div className="p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
              Tasa de Conversión / Éxito
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-semibold text-emerald-400">
                {metrics.conversionRate}%
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">de efectividad</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              {metrics.completedOrders} pedidos entregados
            </span>
          </div>
          <div className="w-10 h-10 rounded-[7px] bg-emerald-950/40 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* CARD 3: TOTAL REVENUE */}
        <div className="p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
              Facturación Registrada
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-semibold text-[var(--text-primary)]">
                {formatARS(metrics.totalRevenue)}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              Promedio: {formatARS(metrics.averageTicket)} / pedido
            </span>
          </div>
          <div className="w-10 h-10 rounded-[7px] bg-amber-950/40 border border-amber-800 text-amber-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* CARD 4: PRODUCTION PIPELINE EFFICIENCY */}
        <div className="p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-none flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-medium block">
              Taller en Tiempo Real
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-semibold text-sky-400">
                {metrics.inProductionOrders}
              </span>
              <span className="text-xs text-sky-500 font-medium">en máquinas</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              Cola de impresión y confección
            </span>
          </div>
          <div className="w-10 h-10 rounded-[7px] bg-sky-950/40 border border-sky-800 text-sky-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2 CHARTS: MONTHLY ORDER VOLUME & PIPELINE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* CHART 1: MONTHLY VOLUME & BILLING (SPAN 2 COLS) */}
        <div className="lg:col-span-2 p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Volumen Mensual de Pedidos & Tendencia
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Cantidad de órdenes procesadas por el taller por período
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary"></span>
              <span>Órdenes</span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                  allowDecimals={false} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                    borderRadius: "7px",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  }}
                  formatter={(value: any) => [`${value} pedidos`, "Volumen"]}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Bar 
                  dataKey="orders" 
                  fill="var(--color-primary, #2563EB)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={36} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: CONVERSION PIPELINE DISTRIBUTION (SPAN 1 COL) */}
        <div className="p-4 rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
              Embudo y Tasa de Conversión
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">
              Eficiencia desde cotización pendiente hasta despacho
            </p>

            <div className="space-y-3 pt-2">
              {metrics.pipelineData.map((item) => {
                const percentage = metrics.totalOrdersCount > 0 
                  ? Math.round((item.count / metrics.totalOrdersCount) * 100) 
                  : 0;

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">{item.name}</span>
                      <span className="font-mono font-medium text-[var(--text-primary)]">
                        {item.count} <span className="text-[10px] text-[var(--text-secondary)]">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-[3px] bg-[var(--bg-surface-subtle)] overflow-hidden">
                      <div 
                        className="h-full rounded-[3px] transition-all duration-500" 
                        style={{ width: `${percentage}%`, backgroundColor: item.fill }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">Ratio de Finalización:</span>
            <span className="font-mono font-bold text-emerald-400">
              {metrics.conversionRate}% éxito
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
