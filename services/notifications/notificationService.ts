import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { AppLogger } from '@/utils/logger';

// Configurar el comportamiento de las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Registra el dispositivo para recibir notificaciones push
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        AppLogger.warn('Las notificaciones push solo funcionan en dispositivos físicos');
        return null;
      }

      // Verificar permisos existentes
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Solicitar permisos si no los tiene
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        AppLogger.error('No se otorgaron permisos para notificaciones');
        return null;
      }

      // Por ahora, usar solo notificaciones locales sin FCM
      // Para producción, necesitarás configurar Firebase siguiendo:
      // https://docs.expo.dev/push-notifications/fcm-credentials/
      AppLogger.success('Permisos de notificaciones otorgados');
      this.expoPushToken = 'local-notifications-only';

      // Configurar canal de notificación para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarm', {
          name: 'Alarmas de Seguridad',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF3B30',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      return this.expoPushToken;
    } catch (error) {
      AppLogger.error('Error al registrar notificaciones:', error);
      return null;
    }
  }

  /**
   * Obtiene el token de push actual
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Muestra una notificación local de alarma
   */
  async showAlarmNotification(deviceName: string, deviceMac: string): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Alarma Activada',
          body: `Se detectó movimiento en ${deviceName}`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          data: {
            type: 'alarm',
            deviceMac: deviceMac,
            deviceName: deviceName,
            screen: 'device-detail',
          },
          categoryIdentifier: 'ALARM_CATEGORY',
        },
        trigger: null, // null = mostrar inmediatamente
      });

      AppLogger.success('Notificación de alarma mostrada:', notificationId);
      return notificationId;
    } catch (error) {
      AppLogger.error('Error al mostrar notificación:', error);
      throw error;
    }
  }

  /**
   * Configura las categorías de notificación con acciones
   */
  async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('ALARM_CATEGORY', [
        {
          identifier: 'DEACTIVATE',
          buttonTitle: 'Desactivar Alarma',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'VIEW',
          buttonTitle: 'Ver Detalles',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
      
      AppLogger.log('Categorías de notificación configuradas');
    } catch (error) {
      AppLogger.error('Error al configurar categorías:', error);
    }
  }

  /**
   * Cancela todas las notificaciones pendientes
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      AppLogger.log('Todas las notificaciones canceladas');
    } catch (error) {
      AppLogger.error('Error al cancelar notificaciones:', error);
    }
  }

  /**
   * Configura listeners para respuestas a notificaciones
   */
  addNotificationResponseListener(
    handler: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }

  /**
   * Configura listeners para notificaciones recibidas
   */
  addNotificationReceivedListener(
    handler: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(handler);
  }

  /**
   * Obtiene el badge count actual
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Establece el badge count
   */
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Limpia el badge count
   */
  async clearBadgeCount() {
    await Notifications.setBadgeCountAsync(0);
  }
}

export const notificationService = new NotificationService();
