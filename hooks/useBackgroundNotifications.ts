import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { socketService } from '@/services/socket/socketService';
import { notificationService } from '@/services/notifications/notificationService';
import { useAuth } from '@/context';
import { AppLogger } from '@/utils/logger';
import type { Event } from '@/services/events/event.types';

/**
 * Hook para manejar notificaciones push en background
 * Este hook escucha eventos de WebSocket incluso cuando la app está en background
 * y muestra notificaciones push cuando se detecta movimiento
 */
export function useBackgroundNotifications() {
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!user?.id) return;

    // Conectar WebSocket para escuchar eventos globalmente
    socketService.connect(user.id);

    // Listener para cambios en el estado de la app
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Listener global para eventos de movimiento
    socketService.onMotionEvent(handleGlobalMotionEvent);

    return () => {
      subscription.remove();
      socketService.disconnect();
    };
  }, [user?.id]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      AppLogger.log('App volvió a primer plano');
      // Limpiar badge cuando la app vuelve a primer plano
      notificationService.clearBadgeCount();
    }

    appState.current = nextAppState;
    AppLogger.log('Estado de la app:', nextAppState);
  };

  const handleGlobalMotionEvent = async (event: Event) => {
    // Solo mostrar notificación si la app está en background
    const currentState = AppState.currentState;
    
    if (currentState === 'background' || currentState === 'inactive') {
      AppLogger.log('App en background, enviando notificación push');
      
      try {
        // Obtener nombre del dispositivo del evento o usar MAC
        const deviceName = event.deviceMac || 'Dispositivo';
        
        await notificationService.showAlarmNotification(
          deviceName,
          event.deviceMac
        );
        
        // Incrementar badge
        const currentBadge = await notificationService.getBadgeCount();
        await notificationService.setBadgeCount(currentBadge + 1);
        
        AppLogger.success('Notificación push enviada en background');
      } catch (error) {
        AppLogger.error('Error al enviar notificación en background:', error);
      }
    }
  };
}
