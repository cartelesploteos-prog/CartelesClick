import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  PackageCheck,
  DollarSign,
  Layers,
  BarChart3,
  Percent,
  Calendar,
  Sparkles,
  Database,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Order } from "../../types";
import { db } from "../../lib/firestore";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface DashboardMetricsProps {
  orders?: Order[];
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ orders: initialOrders }) => {
  const [firestoreOrders, setFirestoreOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiveFromFirestore, setIsLiveFromFirestore] = useState(false);

  // Fetch or complement with Firestore orders for real-time calculation
  useEffect(() => {
    let isMounted = true;
    const fetchFirestoreOrders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));
        const snap = await getDocs(q);
        if (!snap.empty && isMounted) {
          const loaded = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];
          setFirestoreOrders(loaded);
          setIsLiveFromFirestore(true);
        }
      } catch (err) {
        console.warn("DashboardMetrics: lectura fallback de Firestore completada", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFirestoreOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeOrders = useMemo(() => {
    // Prefer passed orders if populated, else use Firestore fetched orders
    if (initialOrders && initialOrders.length > 0) {
      return initialOrders;
    }
    return firestoreOrders;
  }, [initialOrders, firestoreOrders]);

  // =========================================================================
  // 📊 KPIS & MONTHLY VOLUME + CONVERSION RATE CALCULATION (FIRESTORE DATA)
  // =========================================================================
  const {
    monthlyVolumeData,
    materialStatsData,
    overallConversionRate,
    totalRevenueARS,
    totalOrdersCount,
    currentMonthOrders,
    currentMonthRevenue,
    activeInProductionCount,
    convertedOrdersCount,
  } = useMemo(() => {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();

    // Generate last 6 calendar months
    const monthlyMap: Record<
      string,
      {
        key: string;
        month: string;
        totalOrders: number;
        convertedOrders: number;
        conversionRate: number;
        revenueARS: number;
      }
    > = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      monthlyMap[key] = {
        key,
        month: label,
        totalOrders: 0,
        convertedOrders: 0,
        conversionRate: 0,
        revenueARS: 0,
      };
    }

    let completedOrInFlightTotal = 0;
    let totalRevenue = 0;
    let inProdTotal = 0;

    const materialMap: Record<string, { material: string; totalRevenue: number; orderCount: number }> = {};

    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    activeOrders.forEach((ord) => {
      const rawDate = ord.createdAt ? new Date(ord.createdAt) : now;
      const key = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, "0")}`;
      const amount = Number(ord.totalAmountARS || (ord as any).totalPriceARS) || 0;
      totalRevenue += amount;

      const isConverted =
        ord.status === "entregado" ||
        ord.status === "despachado" ||
        ord.status === "en_produccion" ||
        ord.status === "terminaciones";

      if (isConverted) completedOrInFlightTotal += 1;
      if (ord.status === "en_produccion" || ord.status === "terminaciones") inProdTotal += 1;

      if (monthlyMap[key]) {
        monthlyMap[key].totalOrders += 1;
        monthlyMap[key].revenueARS += amount;
        if (isConverted) {
          monthlyMap[key].convertedOrders += 1;
        }
      }

      // Material Stats
      if (Array.isArray(ord.items)) {
        ord.items.forEach((item: any) => {
          const mat = item.materialName || "Otros / Sin Especificar";
          const itemRev = Number(item.totalPriceARS) || 0;
          if (!materialMap[mat]) {
            materialMap[mat] = { material: mat, totalRevenue: 0, orderCount: 0 };
          }
          materialMap[mat].totalRevenue += itemRev;
          // To approximate orderCount per material, we just increment it per item 
          // or we can just count it once per order if we use a Set. We'll use a Set
        });
        
        // Count distinct materials for this order
        const uniqueMats = new Set(ord.items.map((i: any) => i.materialName || "Otros / Sin Especificar"));
        uniqueMats.forEach(mat => {
          if (materialMap[mat]) materialMap[mat].orderCount += 1;
        });
      }
    });

    const materialStatsData = Object.values(materialMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate conversion rate for each month
    const monthlyVolumeData = Object.values(monthlyMap).map((m) => {
      const rate = m.totalOrders > 0 ? Math.round((m.convertedOrders / m.totalOrders) * 100) : 0;
      return {
        ...m,
        conversionRate: rate,
      };
    });

    const overallConversionRate =
      activeOrders.length > 0 ? Math.round((completedOrInFlightTotal / activeOrders.length) * 100) : 0;

    const currentMonthStats = monthlyMap[currentMonthKey] || { totalOrders: 0, revenueARS: 0 };

    return {
      monthlyVolumeData,
      materialStatsData,
      overallConversionRate,
      totalRevenueARS: totalRevenue,
      totalOrdersCount: activeOrders.length,
      currentMonthOrders: currentMonthStats.totalOrders,
      currentMonthRevenue: currentMonthStats.revenueARS,
      activeInProductionCount: inProdTotal,
      convertedOrdersCount: completedOrInFlightTotal,
    };
  }, [activeOrders]);

  const formatARS = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-[var(--space-sm)] mb-[var(--space-md)]">
      {/* ========================================================================= */}
      {/* 🎯 TARJETA RESUMEN DESTACADA: TASA DE CONVERSIÓN GLOBAL EXTRAÍDA DE FIRESTORE */}
      {/* ========================================================================= */}
      <div className="p-[var(--space-md)] rounded-[7px] bg-[var(--bg-surface)] border border-emerald-500/30 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[var(--space-sm)]">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-3 h-3" />
                Firestore Live Metrics
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Base de datos centralizada
              </span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Tasa de Conversión Global: <span className="text-emerald-400 font-mono-num">{overallConversionRate}%</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              De los <strong className="text-[var(--text-primary)] font-mono-num">{totalOrdersCount}</strong> pedidos registrados en Firestore,{" "}
              <strong className="text-emerald-400 font-mono-num">{convertedOrdersCount}</strong> han avanzado a etapas productivas o entrega final (En Producción, Terminaciones o Despachados).
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                Efectividad de Venta
              </div>
              <div className="font-mono-num text-3xl font-bold text-emerald-400">
                {overallConversionRate}%
              </div>
              <div className="text-[10px] text-[var(--text-secondary)]">
                {convertedOrdersCount} / {totalOrdersCount} pedidos procesados
              </div>
            </div>

            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
              <div
                className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400"
              >
                <Percent className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar representation */}
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-3">
          <div className="flex-1 bg-[var(--bg-surface-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(overallConversionRate, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono-num text-[var(--text-secondary)] whitespace-nowrap">
            Objetivo taller: &gt;70%
          </span>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-xs)]">
        {/* Volumen Mensual */}
        <div className="p-[var(--space-sm)] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Volumen del Mes</span>
            <div className="p-1.5 rounded-[5px] bg-[var(--brand-brick)]/10 text-[var(--brand-brick)]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-num font-bold text-2xl text-[var(--text-primary)]">
              {currentMonthOrders}{" "}
              <span className="text-xs font-normal text-[var(--text-secondary)]">pedidos</span>
            </span>
            <span className="text-[11px] font-mono-num text-[var(--text-secondary)]">
              Total acum.: {totalOrdersCount}
            </span>
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className="p-[var(--space-sm)] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tasa de Conversión</span>
            <div className="p-1.5 rounded-[5px] bg-emerald-500/10 text-emerald-500">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-num font-bold text-2xl text-emerald-500">
              {overallConversionRate}%
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Cotizaciones a producción
            </span>
          </div>
        </div>

        {/* En Taller / Producción */}
        <div className="p-[var(--space-sm)] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">En Fabricación</span>
            <div className="p-1.5 rounded-[5px] bg-amber-500/10 text-amber-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-num font-bold text-2xl text-amber-500">
              {activeInProductionCount}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              En plóter o taller
            </span>
          </div>
        </div>

        {/* Facturación Mensual */}
        <div className="p-[var(--space-sm)] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Facturación Mensual</span>
            <div className="p-1.5 rounded-[5px] bg-sky-500/10 text-sky-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-num font-bold text-lg text-[var(--text-primary)] truncate">
              {formatARS(currentMonthRevenue)}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">
              ARS
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📈 GRÁFICO DE LÍNEAS DEL VOLUMEN DE PEDIDOS MENSUALES (RECHARTS)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-sm)]">
        {/* GRÁFICO DE LÍNEAS: VOLUMEN DE PEDIDOS MENSUALES */}
        <div className="p-[var(--space-md)] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--brand-brick)]" />
              <h3 className="font-heading text-sm font-medium text-[var(--text-primary)]">
                Volumen de Pedidos Mensuales (Gráfico de Líneas)
              </h3>
            </div>
            <span className="text-[11px] font-mono-num text-[var(--text-secondary)]">
              Últimos 6 meses
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyVolumeData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-subtle)" }}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-[var(--text-primary)]">{label}</p>
                          <p className="text-[var(--brand-brick)] font-mono-num font-medium">
                            Pedidos Totales: <strong>{data.totalOrders}</strong>
                          </p>
                          <p className="text-emerald-400 font-mono-num font-medium">
                            Aprobados / Producción: <strong>{data.convertedOrders}</strong>
                          </p>
                          <p className="text-sky-400 font-mono-num text-[11px]">
                            Facturación: {formatARS(data.revenueARS)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="totalOrders"
                  name="Pedidos Totales"
                  stroke="[var(--brand-brick)]"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "[var(--brand-brick)]" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="convertedOrders"
                  name="Pedidos en Taller / Entregados"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#10B981" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TASA DE CONVERSIÓN MENSUAL (ÁREA / TENDENCIA) */}
        <div className="p-[var(--space-md)] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="font-heading text-sm font-medium text-[var(--text-primary)]">
                Evolución de Tasa de Conversión (%)
              </h3>
            </div>
            <span className="text-[11px] font-mono-num text-emerald-500 font-medium">
              Promedio: {overallConversionRate}%
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyVolumeData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="conversionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-subtle)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="var(--text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-[var(--text-primary)]">{label}</p>
                          <p className="text-emerald-500 font-mono-num font-medium">
                            Tasa de Conversión: <strong>{data.conversionRate}%</strong>
                          </p>
                          <p className="text-[var(--text-secondary)] font-mono-num text-[11px]">
                            {data.convertedOrders} aprobados de {data.totalOrders} pedidos
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="conversionRate"
                  name="Conversión (%)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#conversionGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 GRÁFICO DE BARRAS DE RENDIMIENTO POR MATERIAL (RECHARTS)              */}
      {/* ========================================================================= */}
      <div className="p-[var(--space-md)] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 mt-[var(--space-md)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <h3 className="font-heading text-sm font-medium text-[var(--text-primary)]">
              Rendimiento de Ventas por Material
            </h3>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={materialStatsData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: "var(--text-secondary)" }} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val / 1000)}k`} />
              <YAxis type="category" dataKey="material" width={100} tick={{ fill: "var(--text-secondary)" }} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg text-xs space-y-1">
                        <p className="font-semibold text-[var(--text-primary)]">{label}</p>
                        <p className="text-sky-500 font-mono-num font-medium">
                          Facturación: <strong>{formatARS(data.totalRevenue)}</strong>
                        </p>
                        <p className="text-[var(--text-secondary)] font-mono-num text-[11px]">
                          Pedidos: {data.orderCount}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="totalRevenue" fill="#0EA5E9" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;

