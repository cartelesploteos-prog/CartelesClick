import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Package,
  Sparkles,
  BookOpen,
  Settings,
  Mail,
  X,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { AppNotification, NotificationType } from '../../types/notifications';

interface NotificationCenterProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
    preferences,
    updatePreferences
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [emailInput, setEmailInput] = useState(preferences.userEmail || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_status':
        return <Package className="w-4 h-4 text-emerald-400" />;
      case 'promotion':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'blog':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'order_status':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Pedido</span>;
      case 'promotion':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Promo</span>;
      case 'blog':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Blog</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-medium">Aviso</span>;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Ahora';
      if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.read) {
      markAsRead(item.id);
    }
    if (item.link && onNavigate) {
      onNavigate(item.link);
      setIsOpen(false);
    }
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({ userEmail: emailInput });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="relative">
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer"
        aria-label="Centro de Notificaciones"
        title="Notificaciones en tiempo real"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[9px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? '+9' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 mt-2 w-[360px] sm:w-[420px] max-w-[calc(100vw-24px)] z-50 rounded-2xl bg-[#14151B] border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden flex flex-col max-h-[560px]"
            >
              {/* HEADER */}
              <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="font-heading text-sm font-semibold text-white">
                    Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && activeTab !== 'settings' && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                      title="Marcar todas como leídas"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline text-[11px]">Leídas</span>
                    </button>
                  )}
                  {notifications.length > 0 && activeTab !== 'settings' && (
                    <button
                      onClick={clearAll}
                      className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors text-xs"
                      title="Vaciar notificaciones"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="flex items-center px-4 pt-2 border-b border-white/5 bg-white/[0.01]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all ${
                    activeTab === 'all'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all ${
                    activeTab === 'unread'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  No leídas ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all ml-auto flex items-center gap-1 ${
                    activeTab === 'settings'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Settings className="w-3 h-3" />
                  <span>Ajustes</span>
                </button>
              </div>

              {/* CONTENT BODY */}
              <div className="overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
                {activeTab === 'settings' ? (
                  <div className="p-4 space-y-4 text-xs">
                    <div>
                      <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span>Canales de Notificación</span>
                      </h4>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">
                        Elegí cómo querés recibir novedades de tus pedidos, promociones y actualizaciones.
                      </p>
                    </div>

                    {/* PREFERENCES TOGGLES */}
                    <div className="space-y-2.5 pt-1">
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05]">
                        <div className="space-y-0.5">
                          <span className="font-medium text-white block">Estado de Pedidos</span>
                          <span className="text-[10px] text-zinc-400 block">Cambios de estado (En producción, Despachado, Listo)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.orderUpdates}
                          onChange={(e) => updatePreferences({ orderUpdates: e.target.checked })}
                          className="accent-primary w-4 h-4 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05]">
                        <div className="space-y-0.5">
                          <span className="font-medium text-white block">Promociones & Descuentos</span>
                          <span className="text-[10px] text-zinc-400 block">Ofertas por metro cuadrado y bonificaciones por volumen</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.promotions}
                          onChange={(e) => updatePreferences({ promotions: e.target.checked })}
                          className="accent-primary w-4 h-4 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05]">
                        <div className="space-y-0.5">
                          <span className="font-medium text-white block">Guías Técnicas & Blog</span>
                          <span className="text-[10px] text-zinc-400 block">Tips de preparación de archivos, sustratos y montajes</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.blogUpdates}
                          onChange={(e) => updatePreferences({ blogUpdates: e.target.checked })}
                          className="accent-primary w-4 h-4 rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05]">
                        <div className="space-y-0.5">
                          <span className="font-medium text-white block">Copia por Correo Electrónico</span>
                          <span className="text-[10px] text-zinc-400 block">Envío automático de comprobantes y alertas a tu casilla</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => updatePreferences({ emailNotifications: e.target.checked })}
                          className="accent-primary w-4 h-4 rounded cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* EMAIL INPUT */}
                    {preferences.emailNotifications && (
                      <form onSubmit={handleSaveEmail} className="pt-2 border-t border-white/5 space-y-2">
                        <label className="block text-[11px] text-zinc-400">
                          Casilla de correo destinataria:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="ejemplo@carteles.click"
                            required
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-xs transition-colors"
                          >
                            Guardar
                          </button>
                        </div>
                        {saveSuccess && (
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Email actualizado correctamente
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-500">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-zinc-300">
                      {activeTab === 'unread' ? 'No tenés notificaciones pendientes' : 'Bandeja vacía'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Te avisaremos al instante cuando cambie el estado de tus pedidos o tengamos novedades.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 hover:bg-white/[0.04] transition-all cursor-pointer flex gap-3 items-start relative group ${
                        !item.read ? 'bg-primary/[0.04]' : ''
                      }`}
                    >
                      {/* UNREAD INDICATOR */}
                      {!item.read && (
                        <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-primary shadow-xs" />
                      )}

                      {/* ICON CONTAINER */}
                      <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        {getIcon(item.type)}
                      </div>

                      {/* TEXT CONTENT */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {getTypeBadge(item.type)}
                            <h4 className={`text-xs font-semibold truncate ${!item.read ? 'text-white' : 'text-zinc-300'}`}>
                              {item.title}
                            </h4>
                          </div>
                          <span className="text-[10px] text-zinc-500 shrink-0 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(item.timestamp)}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {item.message}
                        </p>

                        {/* FOOTER ACTIONS */}
                        <div className="flex items-center justify-between pt-1">
                          {item.emailSent && (
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5 text-zinc-400" /> Enviado por email
                            </span>
                          )}
                          {item.link && (
                            <span className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5 ml-auto">
                              <span>Ver detalle</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER BAR */}
              <div className="p-2.5 px-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Canal en vivo activo</span>
                </span>
                <span className="text-zinc-500 font-mono text-[10px]">Carteles.Click WS v2.4</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
