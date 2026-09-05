import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppNotification, NotificationPreference, NotificationType } from '../types/notifications';

interface NotificationState {
  notifications: AppNotification[];
  preferences: NotificationPreference;
  unreadCount: number;
  isOpen: boolean;
  activeToast: AppNotification | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  updatePreferences: (prefs: Partial<NotificationPreference>) => void;
  clearToast: () => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'order_status',
    title: 'Producción Iniciada',
    message: 'Tu pedido #ORD-7892 (Lona Front 13oz 3x2m) ingresó a taller y está siendo impreso.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    orderId: 'ORD-7892',
    link: 'orders',
    emailSent: true,
    priority: 'high'
  },
  {
    id: 'notif-2',
    type: 'promotion',
    title: '⚡ 20% OFF en Vinilo Microperforado',
    message: 'Esta semana ploteo de vidrieras y lunetas con laminado UV bonificado en pedidos +5m².',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
    link: 'cotizador',
    priority: 'normal'
  },
  {
    id: 'notif-3',
    type: 'blog',
    title: 'Nueva Guía Técnica',
    message: 'Publicamos: "Cómo preparar archivos en Illustrator para corte router CNC sin errores".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    link: 'blog',
    priority: 'low'
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      preferences: {
        orderUpdates: true,
        promotions: true,
        blogUpdates: true,
        emailNotifications: true,
        userEmail: 'carteles.ploteos@gmail.com'
      },
      unreadCount: INITIAL_NOTIFICATIONS.filter(n => !n.read).length,
      isOpen: false,
      activeToast: null,

      fetchNotifications: async () => {
        try {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const data = await res.json();
            if (data.notifications) {
              set({
                notifications: data.notifications,
                unreadCount: data.notifications.filter((n: AppNotification) => !n.read).length
              });
            }
          }
        } catch (e) {
          console.warn('Using local notification cache');
        }
      },

      addNotification: async (notifData) => {
        const prefs = get().preferences;
        
        // Filter based on user preferences
        if (notifData.type === 'order_status' && !prefs.orderUpdates) return;
        if (notifData.type === 'promotion' && !prefs.promotions) return;
        if (notifData.type === 'blog' && !prefs.blogUpdates) return;

        const newNotif: AppNotification = {
          ...notifData,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          read: false,
          emailSent: prefs.emailNotifications
        };

        const updated = [newNotif, ...get().notifications];
        set({
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length,
          activeToast: newNotif
        });

        // Sync with backend API
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...newNotif,
              recipientEmail: prefs.emailNotifications ? prefs.userEmail : undefined
            })
          });
        } catch (e) {
          console.warn('Notification sync offline');
        }
      },

      markAsRead: async (id: string) => {
        const updated = get().notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        set({
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        });

        try {
          await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
        } catch (e) {
          // Ignore offline
        }
      },

      markAllAsRead: async () => {
        const updated = get().notifications.map(n => ({ ...n, read: true }));
        set({
          notifications: updated,
          unreadCount: 0
        });

        try {
          await fetch('/api/notifications/read-all', { method: 'PUT' });
        } catch (e) {
          // Ignore offline
        }
      },

      clearAll: async () => {
        set({
          notifications: [],
          unreadCount: 0
        });

        try {
          await fetch('/api/notifications', { method: 'DELETE' });
        } catch (e) {
          // Ignore offline
        }
      },

      setIsOpen: (isOpen) => set({ isOpen }),
      toggleOpen: () => set(state => ({ isOpen: !state.isOpen })),
      
      updatePreferences: (prefs) => set(state => ({
        preferences: { ...state.preferences, ...prefs }
      })),

      clearToast: () => set({ activeToast: null })
    }),
    {
      name: 'carteles-notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        preferences: state.preferences
      })
    }
  )
);
