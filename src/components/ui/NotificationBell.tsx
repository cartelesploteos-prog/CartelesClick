import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Package, 
  Sparkles, 
  BookOpen, 
  AlertTriangle, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Mail, 
  X, 
  ExternalLink,
  ChevronRight,
  Clock
} from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";
import { AppNotification, NotificationType } from "../../types/notifications";

interface NotificationBellProps {
  onNavigate: (view: string, param?: string) => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate, className = "" }) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    preferences,
    updatePreferences
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "settings">("all");
  const [emailInput, setEmailInput] = useState(preferences.userEmail || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "order_status": 
        return <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-400" strokeWidth={1.85} />;
      case "promotion": 
        return <Sparkles className="w-4 h-4 text-[var(--brand-brick)] dark:text-[var(--brand-brick)]" strokeWidth={1.85} />;
      case "blog": 
        return <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.85} />;
      default: 
        return <Bell className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.85} />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "order_status":
        return <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold">Pedido</span>;
      case "promotion":
        return <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-primary/15 text-[var(--brand-brick)] dark:text-[#FFA048] font-semibold">Promo</span>;
      case "blog":
        return <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-blue-500/15 text-blue-800 dark:text-blue-300 font-semibold">Blog</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-zinc-500/15 text-zinc-800 dark:text-zinc-300 font-semibold">Aviso</span>;
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      onNavigate(notif.link);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffInSeconds = (date.getTime() - Date.now()) / 1000;
      const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
      
      if (Math.abs(diffInSeconds) < 60) return "Ahora";
      if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
      if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
      return rtf.format(Math.round(diffInSeconds / 86400), 'day');
    } catch {
      return "";
    }
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({ userEmail: emailInput });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 flex items-center justify-center rounded-[7px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 cursor-pointer relative"
        aria-label="Centro de Notificaciones"
        title="Notificaciones en tiempo real"
      >
        <Bell className="w-5 h-5" strokeWidth={1.85} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-brick)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--brand-brick)] text-[9px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? '+9' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-[380px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[540px]">
          {/* HEADER */}
          <div className="p-3.5 px-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-subtle)]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--brand-brick)] dark:text-[var(--brand-brick)]" strokeWidth={2} />
              <h3 className="font-heading font-semibold text-sm text-[var(--text-primary)]">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[var(--brand-brick)] dark:text-[var(--brand-brick)] text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && activeTab !== 'settings' && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[5px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span className="hidden sm:inline">Leídas</span>
                </button>
              )}
              {notifications.length > 0 && activeTab !== 'settings' && (
                <button
                  onClick={clearAll}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 rounded-[5px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Vaciar notificaciones"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.85} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[5px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex items-center px-4 pt-2 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-3 font-medium border-b-2 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'border-primary text-[var(--brand-brick)] dark:text-[var(--brand-brick)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`pb-2 px-3 font-medium border-b-2 transition-all cursor-pointer ${
                activeTab === 'unread'
                  ? 'border-primary text-[var(--brand-brick)] dark:text-[var(--brand-brick)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              No leídas ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-2 px-3 font-medium border-b-2 transition-all ml-auto flex items-center gap-1 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-primary text-[var(--brand-brick)] dark:text-[var(--brand-brick)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" strokeWidth={1.85} />
              <span>Ajustes</span>
            </button>
          </div>
          
          {/* CONTENT BODY */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {activeTab === 'settings' ? (
              <div className="p-4 space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[var(--brand-brick)] dark:text-[var(--brand-brick)]" strokeWidth={2} />
                    <span>Canales y Notificaciones</span>
                  </h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-[11px]">
                    Configurá qué alertas querés recibir en la web y en tu correo electrónico.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center justify-between p-2.5 rounded-[9px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-medium text-[var(--text-primary)] block">Estado de Pedidos</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block">Producción, despacho, listo para retirar</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdates}
                      onChange={(e) => updatePreferences({ orderUpdates: e.target.checked })}
                      className="accent-[var(--brand-brick)] w-4 h-4 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-[9px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-medium text-[var(--text-primary)] block">Promociones & Ofertas</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block">Descuentos por m² y beneficios por volumen</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.promotions}
                      onChange={(e) => updatePreferences({ promotions: e.target.checked })}
                      className="accent-[var(--brand-brick)] w-4 h-4 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-[9px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-medium text-[var(--text-primary)] block">Guías Técnicas & Blog</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block">Instructivos de armado y preparación de archivos</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.blogUpdates}
                      onChange={(e) => updatePreferences({ blogUpdates: e.target.checked })}
                      className="accent-[var(--brand-brick)] w-4 h-4 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-[9px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-medium text-[var(--text-primary)] block">Copia por Email</span>
                      <span className="text-[10px] text-[var(--text-secondary)] block">Envío automático a tu casilla</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => updatePreferences({ emailNotifications: e.target.checked })}
                      className="accent-[var(--brand-brick)] w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {preferences.emailNotifications && (
                  <form onSubmit={handleSaveEmail} className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <label className="block text-[11px] text-[var(--text-secondary)]">
                      Casilla de correo para avisos:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="cliente@carteles.click"
                        required
                        className="flex-1 px-3 py-1.5 text-xs rounded-[7px] bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-primary hover:bg-[var(--color-primary-hover)] text-white rounded-[7px] font-medium text-xs transition-colors cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                    {saveSuccess && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" strokeWidth={2.5} /> Email guardado correctamente
                      </p>
                    )}
                  </form>
                )}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" strokeWidth={1.5} />
                <p className="font-medium text-[var(--text-primary)]">
                  {activeTab === 'unread' ? 'No tenés notificaciones pendientes' : 'Sin notificaciones'}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Te avisaremos en cuanto cambie el estado de tus pedidos o tengamos novedades.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex gap-3 cursor-pointer hover:bg-[var(--bg-surface-subtle)] transition-colors relative ${
                      !notif.read ? 'bg-primary/[0.04]' : ''
                    }`}
                  >
                    {!notif.read && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    <div className="mt-0.5 shrink-0">
                      <div className="w-8 h-8 rounded-[7px] bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-subtle)]">
                        {getIcon(notif.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {getTypeBadge(notif.type)}
                          <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                            {notif.title}
                          </p>
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)] shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        {notif.emailSent && (
                          <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" /> Copia enviada por email
                          </span>
                        )}
                        {notif.link && (
                          <span className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5 ml-auto">
                            <span>Ver detalle</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-2.5 px-4 bg-[var(--bg-surface-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Canal de notificaciones activo</span>
            </span>
            <span className="font-mono text-[10px]">Carteles.Click WS</span>
          </div>
        </div>
      )}
    </div>
  );
};
