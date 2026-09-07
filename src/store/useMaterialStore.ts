import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MaterialData {
  id: string;
  name: string;
  category: string;
  mode: string;
  costARS: number;
  salePriceARS: number;
  marginPercent: number;
  unitLabel: string;
  stockStatus: string;
  shortDesc: string;
  isActive: boolean;
  minAreaM2?: number;
  plateWidthCm?: number;
  plateHeightCm?: number;
  plateAreaM2?: number;
}

interface MaterialState {
  materials: MaterialData[];
  lastFetched: number | null;
  catalogVersion: number | null;
  isLoading: boolean;
  error: string | null;
  fetchMaterials: (forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

const CACHE_DURATION_MS = 1000 * 60 * 60 * 24; // 24 hours

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      materials: [],
      lastFetched: null,
      catalogVersion: null,
      isLoading: false,
      error: null,

      fetchMaterials: async (forceRefresh = false) => {
        const { lastFetched, materials, catalogVersion } = get();
        const now = Date.now();

        set({ isLoading: true, error: null });

        try {
          // Check version first
          const versionRes = await fetch('/api/products/version');
          let serverVersion = null;
          if (versionRes.ok) {
            const versionData = await versionRes.json();
            serverVersion = versionData.version;
          }

          // Use cache if not forced, version matches, and within cache duration
          if (!forceRefresh && lastFetched && (now - lastFetched < CACHE_DURATION_MS) && materials.length > 0 && serverVersion === catalogVersion) {
            set({ isLoading: false });
            return;
          }

          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('Error fetching materials');
          const data = await res.json();
          set({ 
            materials: data.products || [], 
            lastFetched: now,
            catalogVersion: serverVersion,
            isLoading: false 
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      invalidateCache: () => {
        set({ lastFetched: null });
      }
    }),
    {
      name: 'carteles-material-cache',
    }
  )
);
