export type NotificationType = 'order_status' | 'promotion' | 'blog' | 'system';

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
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationPreference {
  orderUpdates: boolean;
  promotions: boolean;
  blogUpdates: boolean;
  emailNotifications: boolean;
  userEmail: string;
}
