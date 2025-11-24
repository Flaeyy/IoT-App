import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { notificationService } from '@/services/notifications/notificationService';
import { AppLogger } from '@/utils/logger';

function RootNavigator() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Inicializar notificaciones
    initializeNotifications();

    // Configurar listeners
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        AppLogger.log('Notificación recibida:', notification);
      }
    );

    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        AppLogger.log('Usuario interactuó con notificación:', response);
        
        // Obtener datos de la notificación
        const data = response.notification.request.content.data;
        
        if (data.type === 'alarm' && data.deviceMac) {
          // Navegar a la pantalla de detalle del dispositivo
          router.push({
            pathname: '/device-detail',
            params: { macAddress: data.deviceMac },
          });
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.setupNotificationCategories();
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        AppLogger.success('App lista para recibir notificaciones');
      }
    } catch (error) {
      AppLogger.error('Error al inicializar notificaciones:', error);
    }
  };

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="add-device" options={{ headerShown: false }} />
      <Stack.Screen name="alarm" options={{ headerShown: false }} />
      <Stack.Screen name="device-detail" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
