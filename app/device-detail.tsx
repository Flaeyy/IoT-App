import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  AppState,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { deviceService } from '@/services/devices/deviceService';
import { eventsService } from '@/services/events/eventsService';
import { socketService } from '@/services/socket/socketService';
import { notificationService } from '@/services/notifications/notificationService';
import { useAuth } from '@/context';
import { AppLogger } from '@/utils/logger';
import { DeviceMode, getDeviceMode, saveDeviceMode } from '@/services/storage/deviceModeStorage';
import type { DeviceResponse } from '@/services/devices/device.types';
import type { Event, EventType } from '@/services/events/event.types';

export default function DeviceDetailScreen() {
  const params = useLocalSearchParams<{ macAddress: string }>();
  const macAddress = params.macAddress;
  const { user } = useAuth();

  const [device, setDevice] = useState<DeviceResponse | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deactivatingAlarm, setDeactivatingAlarm] = useState(false);
  const [hasActiveAlarm, setHasActiveAlarm] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(DeviceMode.AUTOMATIC);
  const [changingMode, setChangingMode] = useState(false);

  // Cargar modo guardado en storage al iniciar
  useEffect(() => {
    if (macAddress) {
      loadSavedMode();
    }
  }, [macAddress]);

  const loadSavedMode = async () => {
    try {
      const savedMode = await getDeviceMode(macAddress);
      setDeviceMode(savedMode);
      AppLogger.log('Modo guardado cargado:', savedMode);
    } catch (error) {
      AppLogger.error('Error al cargar modo guardado', error);
    }
  };

  // Conectar WebSocket cuando se monta el componente
  useEffect(() => {
    if (user?.id) {
      AppLogger.log('Conectando WebSocket', { userId: user.id });
      socketService.connect(user.id);

      // Escuchar eventos de movimiento en tiempo real
      socketService.onMotionEvent(handleNewMotionEvent);

      // Escuchar cambios en el estado de alarma
      socketService.onAlarmStatus(handleAlarmStatusChange);

      return () => {
        // Limpiar al desmontar
        AppLogger.log('Desconectando WebSocket');
        socketService.disconnect();
      };
    }
  }, [user]);

  // Handler para nuevos eventos de movimiento
  const handleNewMotionEvent = useCallback(async (event: Event) => {
    AppLogger.success('🚨 Nuevo evento de movimiento recibido en tiempo real!', event);
    
    // Solo agregar si es del dispositivo actual
    if (event.deviceMac === macAddress) {
      setEvents(prevEvents => [event, ...prevEvents]);
      setHasActiveAlarm(event.isAlarmActive);
      
      // Verificar si la app está en background o el teléfono bloqueado
      const appState = AppState.currentState;
      const isBackground = appState === 'background' || appState === 'inactive';
      
      if (isBackground) {
        // Mostrar notificación push si está en background
        try {
          await notificationService.showAlarmNotification(
            device?.name || 'Dispositivo',
            macAddress
          );
          AppLogger.log('Notificación push enviada');
        } catch (error) {
          AppLogger.error('Error al enviar notificación:', error);
        }
      } else {
        // Mostrar alerta si está en foreground
        Alert.alert(
          '🚨 Movimiento Detectado',
          `Se ha detectado movimiento en ${device?.name || 'tu dispositivo'}`,
          [
            { text: 'Ver Detalles', onPress: () => {}, style: 'default' },
            { text: 'OK', style: 'cancel' }
          ]
        );
      }
    }
  }, [macAddress, device]);

  // Handler para cambios en el estado de alarma
  const handleAlarmStatusChange = useCallback((data: { deviceMac: string; alarmActive: boolean }) => {
    AppLogger.log('🔔 Cambio en estado de alarma', data);
    
    if (data.deviceMac === macAddress) {
      setHasActiveAlarm(data.alarmActive);
      
      if (!data.alarmActive) {
        // La alarma fue desactivada, actualizar eventos
        setEvents(prevEvents =>
          prevEvents.map(e =>
            e.isAlarmActive ? { ...e, isAlarmActive: false } : e
          )
        );
      }
    }
  }, [macAddress]);

  useEffect(() => {
    if (macAddress) {
      loadData();
    }
  }, [macAddress]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadDevice(), loadEvents()]);
    } catch (error) {
      AppLogger.error('Error al cargar datos', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const loadDevice = async () => {
    try {
      const deviceData = await deviceService.getDeviceByMac(macAddress);
      setDevice(deviceData);
      AppLogger.log('Dispositivo cargado', deviceData);
    } catch (error) {
      AppLogger.error('Error al cargar dispositivo', error);
      throw error;
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await eventsService.getDeviceEvents(macAddress, 100);
      setEvents(eventsData);
      
      // Verificar si hay alarmas activas
      const activeAlarm = eventsData.some(e => e.isAlarmActive);
      setHasActiveAlarm(activeAlarm);
      
      AppLogger.log(`Eventos cargados: ${eventsData.length}`, { hasActiveAlarm: activeAlarm });
    } catch (error) {
      AppLogger.error('Error al cargar eventos', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeactivateAlarm = async () => {
    if (!macAddress) return;

    setDeactivatingAlarm(true);
    try {
      AppLogger.log('Desactivando alarma', { mac: macAddress });
      const result = await deviceService.deactivateAlarm(macAddress);
      
      if (result.success) {
        Alert.alert(
          '✓ Alarma Desactivada',
          'La alarma del buzzer ha sido desactivada exitosamente.',
          [{ text: 'OK' }]
        );
        // Recargar eventos para actualizar el estado
        await loadEvents();
        AppLogger.success('Alarma desactivada exitosamente');
      }
    } catch (error: any) {
      AppLogger.error('Error al desactivar alarma', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo desactivar la alarma. Verifica tu conexión.',
        [{ text: 'OK' }]
      );
    } finally {
      setDeactivatingAlarm(false);
    }
  };

  const handleModeChange = async (newMode: DeviceMode) => {
    if (!macAddress || changingMode) return;

    setChangingMode(true);
    try {
      AppLogger.log('Cambiando modo de dispositivo', { mac: macAddress, newMode });
      
      // Llamar API para actualizar modo
      const result = await deviceService.updateDeviceMode(macAddress, newMode);
      
      // Guardar en storage local
      await saveDeviceMode(macAddress, newMode);
      
      // Actualizar estado local
      setDeviceMode(newMode);
      
      const modeNames = {
        [DeviceMode.AUTOMATIC]: 'Automático',
        [DeviceMode.DISABLED]: 'Desactivado',
        [DeviceMode.ACTIVE]: 'Activo',
      };
      
      Alert.alert(
        '✓ Modo Actualizado',
        `El dispositivo ahora está en modo ${modeNames[newMode]}.`,
        [{ text: 'OK' }]
      );
      
      AppLogger.success('Modo actualizado exitosamente', result);
    } catch (error: any) {
      AppLogger.error('Error al cambiar modo', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo cambiar el modo del dispositivo.',
        [{ text: 'OK' }]
      );
    } finally {
      setChangingMode(false);
    }
  };

  const handleToggleDevice = () => {
    Alert.alert(
      'Próximamente',
      'La funcionalidad de activar/desactivar dispositivo estará disponible pronto.',
      [{ text: 'OK' }]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const getEventIcon = (eventType: EventType) => {
    switch (eventType) {
      case 'motion_detected':
        return 'figure.walk' as const;
      case 'device_online':
        return 'wifi' as const;
      case 'device_offline':
        return 'wifi.slash' as const;
      case 'device_armed':
        return 'lock.shield.fill' as const;
      case 'device_disarmed':
        return 'lock.open.fill' as const;
      default:
        return 'circle.fill' as const;
    }
  };

  const getEventColor = (event: Event): string => {
    return event.isAlarmActive ? '#FF3B30' : '#0D7AB8';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const eventColor = getEventColor(item);
    
    return (
      <View style={[styles.eventCard, { borderLeftColor: eventColor }]}>
        <View style={styles.eventHeader}>
          <View style={[styles.eventIconContainer, { backgroundColor: eventColor + '20' }]}>
            <IconSymbol 
              name={getEventIcon(item.eventType)} 
              size={20} 
              color={eventColor} 
            />
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventDescription}>{item.description}</Text>
            <Text style={styles.eventTime}>{formatDate(item.createdAt)}</Text>
          </View>
          {item.isAlarmActive && (
            <View style={styles.alarmBadge}>
              <Text style={styles.alarmBadgeText}>🔔</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
        style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  if (!device) {
    return (
      <LinearGradient
        colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
        style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>Dispositivo no encontrado</Text>
        <TouchableOpacity style={styles.backButtonBottom} onPress={handleBack}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <IconSymbol name="chevron.left" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Header del Dispositivo */}
      <View style={styles.header}>
        <Text style={styles.title}>{device.name || 'Dispositivo'}</Text>
        <Text style={styles.subtitle}>MAC: {device.macAddress}</Text>
      </View>

      {/* Control de Modo del Dispositivo */}
      <View style={styles.controlCard}>
        <Text style={styles.controlLabel}>Modo de Operación</Text>
        <View style={styles.modeButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceMode === DeviceMode.AUTOMATIC && styles.modeButtonActive,
              changingMode && styles.buttonDisabled,
            ]}
            onPress={() => handleModeChange(DeviceMode.AUTOMATIC)}
            activeOpacity={0.7}
            disabled={changingMode}
          >
            <IconSymbol 
              name="rays" 
              size={20} 
              color={deviceMode === DeviceMode.AUTOMATIC ? '#FFFFFF' : '#0D7AB8'} 
            />
            <Text style={[
              styles.modeButtonText,
              deviceMode === DeviceMode.AUTOMATIC && styles.modeButtonTextActive,
            ]}>
              Automático
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceMode === DeviceMode.DISABLED && styles.modeButtonActive,
              changingMode && styles.buttonDisabled,
            ]}
            onPress={() => handleModeChange(DeviceMode.DISABLED)}
            activeOpacity={0.7}
            disabled={changingMode}
          >
            <IconSymbol 
              name="xmark.circle.fill" 
              size={20} 
              color={deviceMode === DeviceMode.DISABLED ? '#FFFFFF' : '#0D7AB8'} 
            />
            <Text style={[
              styles.modeButtonText,
              deviceMode === DeviceMode.DISABLED && styles.modeButtonTextActive,
            ]}>
              Desactivado
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              deviceMode === DeviceMode.ACTIVE && styles.modeButtonActive,
              changingMode && styles.buttonDisabled,
            ]}
            onPress={() => handleModeChange(DeviceMode.ACTIVE)}
            activeOpacity={0.7}
            disabled={changingMode}
          >
            <IconSymbol 
              name="checkmark.circle.fill" 
              size={20} 
              color={deviceMode === DeviceMode.ACTIVE ? '#FFFFFF' : '#0D7AB8'} 
            />
            <Text style={[
              styles.modeButtonText,
              deviceMode === DeviceMode.ACTIVE && styles.modeButtonTextActive,
            ]}>
              Activo
            </Text>
          </TouchableOpacity>
        </View>
        {changingMode && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#0D7AB8" />
            <Text style={styles.loadingText}>Actualizando modo...</Text>
          </View>
        )}
      </View>

      {/* Botón de Desactivar Alarma (solo si hay alarma activa) */}
      {hasActiveAlarm && (
        <TouchableOpacity
          style={[styles.alarmButton, deactivatingAlarm && styles.buttonDisabled]}
          onPress={handleDeactivateAlarm}
          activeOpacity={0.7}
          disabled={deactivatingAlarm}
        >
          {deactivatingAlarm ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol name="bell.slash.fill" size={24} color="#FFFFFF" />
              <Text style={styles.alarmButtonText}>Desactivar Alarma</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Historial de Eventos */}
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          Historial de Eventos ({events.length})
        </Text>
        
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#FFFFFF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="tray.fill" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No hay eventos registrados</Text>
            </View>
          }
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.3,
  },
  controlCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  alarmButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alarmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: '#8E8E93',
  },
  alarmBadge: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmBadgeText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButtonBottom: {
    marginTop: 20,
    marginHorizontal: 40,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modeButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#0D7AB8',
    borderColor: '#FFFFFF',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D7AB8',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
