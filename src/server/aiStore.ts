import * as fs from 'fs';
import * as path from 'path';

export interface UserAiUsageRecord {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  costARS: number;
  promptTopic: string;
  headlineGenerated: string;
  status: 'completado' | 'facturado' | 'pendiente';
}

export interface AiPersistenceState {
  globalStats: {
    totalGenerations: number;
    tokensConsumedEstimate: number;
    lastUsedAt: string;
  };
  monthlyLimitPerUser: number;
  dailyLimitPerUser: number;
  userGenerations: Record<string, {
    total: number;
    history: UserAiUsageRecord[];
  }>;
}

const AI_DATA_FILE = path.resolve(process.cwd(), 'data/ai_usage_store.json');

export function loadAiPersistenceState(fallbackFeeARS = 3500): AiPersistenceState {
  try {
    const dir = path.dirname(AI_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(AI_DATA_FILE)) {
      const content = fs.readFileSync(AI_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.globalStats && parsed.userGenerations) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[AI Store] Error cargando datos existentes:', e);
  }

  // Estado inicial por defecto con datos representativos del taller
  const initialState: AiPersistenceState = {
    globalStats: {
      totalGenerations: 16,
      tokensConsumedEstimate: 24500,
      lastUsedAt: new Date().toISOString()
    },
    monthlyLimitPerUser: 15,
    dailyLimitPerUser: 5,
    userGenerations: {
      'carteles.ploteos@gmail.com': {
        total: 4,
        history: [
          {
            id: 'ai-gen-101',
            userId: 'admin_carteles_ploteos',
            userEmail: 'carteles.ploteos@gmail.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
            costARS: fallbackFeeARS,
            promptTopic: 'Portabanner Roll-Up Farmacia y Salud 24hs',
            headlineGenerated: 'FARMACIA DE TURNO Y VACUNATORIO 24HS',
            status: 'facturado'
          },
          {
            id: 'ai-gen-102',
            userId: 'admin_carteles_ploteos',
            userEmail: 'carteles.ploteos@gmail.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            costARS: fallbackFeeARS,
            promptTopic: 'Cartel Frontlight Hamburguesería Artesanal',
            headlineGenerated: 'BURGER FEST · 2X1 EN CERVEZAS TIRADAS',
            status: 'completado'
          },
          {
            id: 'ai-gen-103',
            userId: 'admin_carteles_ploteos',
            userEmail: 'carteles.ploteos@gmail.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            costARS: fallbackFeeARS,
            promptTopic: 'Lona Promocional Feria Textil y Ofertas',
            headlineGenerated: 'GRAN LIQUIDACIÓN DE TEMPORADA -50%',
            status: 'facturado'
          },
          {
            id: 'ai-gen-104',
            userId: 'admin_carteles_ploteos',
            userEmail: 'carteles.ploteos@gmail.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            costARS: fallbackFeeARS,
            promptTopic: 'Ploteo de Vidrieras Estudio Jurídico & Notarial',
            headlineGenerated: 'ASESORAMIENTO INTEGRAL Y TRÁMITES EXPRESS',
            status: 'completado'
          }
        ]
      },
      'rodrigo@fractalmedia.com.ar': {
        total: 3,
        history: [
          {
            id: 'ai-gen-201',
            userId: 'usr-rodrigo',
            userEmail: 'rodrigo@fractalmedia.com.ar',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
            costARS: fallbackFeeARS,
            promptTopic: 'Campaña Lanzamiento Inmobiliario',
            headlineGenerated: 'DEPARTAMENTOS EN POZO CON FINANCIACIÓN',
            status: 'facturado'
          }
        ]
      }
    }
  };

  saveAiPersistenceState(initialState);
  return initialState;
}

export function saveAiPersistenceState(state: AiPersistenceState): void {
  try {
    const dir = path.dirname(AI_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AI_DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('[AI Store] Error persistiendo estado:', e);
  }
}

export class AiQuotaManager {
  private state: AiPersistenceState;
  private getFixedFee: () => number;

  constructor(getFixedFee: () => number) {
    this.getFixedFee = getFixedFee;
    this.state = loadAiPersistenceState(getFixedFee());
  }

  public getState(): AiPersistenceState {
    return this.state;
  }

  public getGlobalStats() {
    return this.state.globalStats;
  }

  public getUserUsage(rawEmail?: string) {
    const email = (rawEmail || 'carteles.ploteos@gmail.com').trim().toLowerCase();
    const userData = this.state.userGenerations[email] || { total: 0, history: [] };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toISOString().slice(0, 10);

    let dailyCount = 0;
    let monthlyCount = 0;

    for (const item of userData.history) {
      const itemDate = new Date(item.timestamp);
      if (itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth) {
        monthlyCount++;
      }
      if (item.timestamp.slice(0, 10) === todayStr) {
        dailyCount++;
      }
    }

    const monthlyLimit = this.state.monthlyLimitPerUser || 15;
    const dailyLimit = this.state.dailyLimitPerUser || 5;

    return {
      userEmail: email,
      monthlyCount,
      monthlyLimit,
      remainingMonthly: Math.max(0, monthlyLimit - monthlyCount),
      isMonthlyBlocked: monthlyCount >= monthlyLimit,
      dailyCount,
      dailyLimit,
      remainingDaily: Math.max(0, dailyLimit - dailyCount),
      isDailyBlocked: dailyCount >= dailyLimit,
      isBlocked: monthlyCount >= monthlyLimit || dailyCount >= dailyLimit,
      fixedFeeARS: this.getFixedFee(),
      totalGenerations: userData.total || userData.history.length,
      history: userData.history
    };
  }

  public recordGeneration(params: {
    userId?: string;
    userEmail?: string;
    promptTopic?: string;
    headlineGenerated?: string;
  }) {
    const email = (params.userEmail || 'carteles.ploteos@gmail.com').trim().toLowerCase();
    const userId = params.userId || 'usr_carteles_click';
    const fee = this.getFixedFee();

    const record: UserAiUsageRecord = {
      id: `ai-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userEmail: email,
      timestamp: new Date().toISOString(),
      costARS: fee,
      promptTopic: params.promptTopic || 'Diseño de Cartel con IA',
      headlineGenerated: params.headlineGenerated || 'Titular Generado',
      status: 'completado'
    };

    if (!this.state.userGenerations[email]) {
      this.state.userGenerations[email] = { total: 0, history: [] };
    }

    this.state.userGenerations[email].total += 1;
    this.state.userGenerations[email].history.unshift(record);

    this.state.globalStats.totalGenerations += 1;
    this.state.globalStats.tokensConsumedEstimate += 1200;
    this.state.globalStats.lastUsedAt = new Date().toISOString();

    saveAiPersistenceState(this.state);
    return record;
  }

  public recordChatLiveSupport() {
    this.state.globalStats.totalGenerations += 1;
    this.state.globalStats.tokensConsumedEstimate += 450;
    this.state.globalStats.lastUsedAt = new Date().toISOString();
    saveAiPersistenceState(this.state);
  }

  public updateLimits(monthlyLimit?: number, dailyLimit?: number) {
    if (typeof monthlyLimit === 'number' && monthlyLimit > 0) {
      this.state.monthlyLimitPerUser = monthlyLimit;
    }
    if (typeof dailyLimit === 'number' && dailyLimit > 0) {
      this.state.dailyLimitPerUser = dailyLimit;
    }
    saveAiPersistenceState(this.state);
    return {
      monthlyLimit: this.state.monthlyLimitPerUser,
      dailyLimit: this.state.dailyLimitPerUser
    };
  }

  public getAdminMetrics() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toISOString().slice(0, 10);

    const usersList: any[] = [];
    let totalBilledARS = 0;
    let todayGenerationsCount = 0;
    let monthGenerationsCount = 0;

    for (const [email, uData] of Object.entries(this.state.userGenerations)) {
      let uDaily = 0;
      let uMonthly = 0;
      let uBilled = 0;

      for (const h of uData.history) {
        uBilled += h.costARS || 0;
        const hDate = new Date(h.timestamp);
        if (hDate.getFullYear() === currentYear && hDate.getMonth() === currentMonth) {
          uMonthly++;
          monthGenerationsCount++;
        }
        if (h.timestamp.slice(0, 10) === todayStr) {
          uDaily++;
          todayGenerationsCount++;
        }
      }

      totalBilledARS += uBilled;
      usersList.push({
        email,
        totalGenerations: uData.total || uData.history.length,
        monthlyGenerations: uMonthly,
        dailyGenerations: uDaily,
        monthlyLimit: this.state.monthlyLimitPerUser || 15,
        remainingMonthly: Math.max(0, (this.state.monthlyLimitPerUser || 15) - uMonthly),
        totalBilledARS: uBilled,
        lastActiveAt: uData.history.length > 0 ? uData.history[0].timestamp : null
      });
    }

    usersList.sort((a, b) => b.totalGenerations - a.totalGenerations);

    return {
      success: true,
      globalStats: this.state.globalStats,
      monthlyLimitPerUser: this.state.monthlyLimitPerUser || 15,
      dailyLimitPerUser: this.state.dailyLimitPerUser || 5,
      fixedFeeARS: this.getFixedFee(),
      metrics: {
        todayGenerationsCount,
        monthGenerationsCount,
        totalBilledARS,
        activeUsersCount: Object.keys(this.state.userGenerations).length,
        estimatedApiCostUSD: (this.state.globalStats.totalGenerations * 0.0025).toFixed(3),
        grossProfitARS: totalBilledARS
      },
      users: usersList
    };
  }
}
