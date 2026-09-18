export type NotificationType = 'order_status' | 'promotion' | 'blog' | 'system' | 'quote' | 'admin_alert';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  link?: string;
  emailSent?: boolean;
  priority?: NotificationPriority;
}

export interface NotificationPreference {
  orderUpdates: boolean;
  promotions: boolean;
  technicalGuides?: boolean;
  emailNotifications: boolean;
  soundEnabled?: boolean;
  blogUpdates?: boolean;
  userEmail?: string;
}
