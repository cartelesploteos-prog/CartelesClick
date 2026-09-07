import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../lib/firestore";

/**
 * Utility to send push notifications to administrators via Firebase Cloud Messaging
 * when a high-value order is created.
 */
export async function sendHighValueOrderNotification(order: any, thresholdARS = 500000) {
  try {
    const total = Number(order.totalAmountARS || order.totalPriceARS || 0);
    
    // Only proceed if the order exceeds the threshold
    if (total >= thresholdARS) {
      console.log(`[FCM] Pedido #${order.orderNumber} supera el umbral ($${total.toLocaleString()}). Preparando notificación push...`);
      
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'default-vapid-key' // fallback to avoid crash
        });

        if (currentToken) {
          // Here we would typically send this token to our backend server
          // which uses firebase-admin to send the actual push notification.
          // For the sake of this client-side utility demonstration:
          const payload = {
            notification: {
              title: '🔥 Nuevo Pedido de Alto Valor',
              body: `El cliente ${order.customerName || 'N/A'} ha realizado un pedido por $${total.toLocaleString('es-AR')}. Revisa el panel de administración.`
            },
            token: currentToken
          };
          
          console.log('[FCM] Token obtenido. Payload generado:', payload);
          
          // In a full implementation, we'd do:
          // await fetch('/api/admin/notifications/send', { method: 'POST', body: JSON.stringify(payload) })
          
          return true;
        } else {
          console.warn('[FCM] No se pudo obtener el token de registro para enviar la notificación.');
          return false;
        }
      } else {
        console.warn('[FCM] Permiso de notificaciones denegado por el usuario.');
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[FCM] Error enviando notificación push:', error);
    return false;
  }
}
