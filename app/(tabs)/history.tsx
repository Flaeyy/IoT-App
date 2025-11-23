import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  View, 
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { eventsService } from '@/services/events/eventsService';
import { Event, EventType } from '@/services/events/event.types';

export default function HistoryScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    try {
      // Obtener todos los eventos del usuario (límite de 100)
      const userEvents = await eventsService.getUserEvents(100);
      setEvents(userEvents);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los eventos');
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
  };

  // Cargar eventos al montar y cada vez que la pantalla gane foco
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const getEventDisplayData = (event: Event) => {
    switch (event.eventType) {
      case EventType.MOTION_DETECTED:
        return {
          icon: 'exclamationmark.triangle.fill',
          color: '#FF5252',
          message: event.description || 'Movimiento detectado',
        };
      case EventType.DEVICE_ARMED:
        return {
          icon: 'lock.shield.fill',
          color: '#4CAF50',
          message: event.description || 'Sistema armado',
        };
      case EventType.DEVICE_DISARMED:
        return {
          icon: 'lock.open.fill',
          color: '#2196F3',
          message: event.description || 'Sistema desarmado',
        };
      case EventType.DEVICE_ONLINE:
        return {
          icon: 'checkmark.circle.fill',
          color: '#4CAF50',
          message: event.description || 'Dispositivo conectado',
        };
      case EventType.DEVICE_OFFLINE:
        return {
          icon: 'xmark.circle.fill',
          color: '#FF9800',
          message: event.description || 'Dispositivo desconectado',
        };
      default:
        return {
          icon: 'clock.fill',
          color: '#757575',
          message: event.description || 'Evento',
        };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Comparar solo la fecha (sin hora)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoy';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long',
      });
    }
  };

  // Agrupar eventos por fecha
  const groupedEvents = events.reduce((groups, event) => {
    const date = formatDate(event.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
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
      
      <Text style={styles.title}>Historial</Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="clock" size={80} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyText}>No hay eventos registrados</Text>
            <Text style={styles.emptySubtext}>
              Los eventos aparecerán aquí cuando se detecte movimiento
            </Text>
          </View>
        ) : (
          Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              
              {dateEvents.map((event) => {
                const displayData = getEventDisplayData(event);
                return (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={[
                      styles.iconContainer, 
                      { backgroundColor: displayData.color + '20' }
                    ]}>
                      <IconSymbol 
                        name={displayData.icon as any}
                        size={24} 
                        color={displayData.color} 
                      />
                    </View>
                    
                    <View style={styles.eventContent}>
                      <Text style={styles.eventMessage}>{displayData.message}</Text>
                      <Text style={styles.eventTime}>
                        {formatTime(event.createdAt)} • {event.deviceMac.substring(9)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 15,
    opacity: 0.9,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
