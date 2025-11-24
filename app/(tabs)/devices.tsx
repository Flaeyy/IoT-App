import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { deviceService } from '@/services/devices/deviceService';
import type { DeviceResponse } from '@/services/devices/device.types';

export default function DevicesScreen() {
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDevices = async () => {
    try {
      const userDevices = await deviceService.getUserDevices();
      setDevices(userDevices);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los dispositivos');
      console.error('Error loading devices:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
  };

  // Cargar dispositivos al montar y cada vez que la pantalla gane foco
  useFocusEffect(
    useCallback(() => {
      loadDevices();
    }, [])
  );

  const handleAddDevice = () => {
    router.push('/add-device');
  };

  const handleDevicePress = (device: DeviceResponse) => {
    // Navegar a la pantalla de detalle del dispositivo
    router.push({
      pathname: '/device-detail',
      params: { macAddress: device.macAddress },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Cargando dispositivos...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mis Dispositivos</Text>
          <Text style={styles.subtitle}>Selecciona un dispositivo para controlarlo</Text>
        </View>

        {/* Botón Agregar Dispositivo */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddDevice}
          activeOpacity={0.8}>
          <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Agregar Dispositivo</Text>
        </TouchableOpacity>

        {/* Lista de Dispositivos */}
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
          }>
          
          {devices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="cube.transparent" size={80} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyText}>No tienes dispositivos vinculados</Text>
              <Text style={styles.emptySubtext}>
                Agrega tu primer ESP32 para comenzar
              </Text>
            </View>
          ) : (
            <View style={styles.devicesGrid}>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceCard}
                  onPress={() => handleDevicePress(device)}
                  activeOpacity={0.7}>
                  
                  {/* Indicador de estado */}
                  <View style={[
                    styles.statusIndicator,
                    device.isActive ? styles.statusOnline : styles.statusOffline
                  ]} />
                  
                  {/* Icono del dispositivo */}
                  <View style={styles.deviceIconContainer}>
                    <IconSymbol 
                      name="cpu.fill" 
                      size={40} 
                      color="#FFFFFF" 
                    />
                  </View>
                  
                  {/* Información del dispositivo */}
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName} numberOfLines={2}>
                      {device.name || 'ESP32'}
                    </Text>
                    <View style={styles.deviceDetails}>
                      <IconSymbol 
                        name="barcode" 
                        size={14} 
                        color="rgba(255, 255, 255, 0.7)" 
                      />
                      <Text style={styles.deviceLocation}>
                        {device.macAddress.substring(9)}
                      </Text>
                    </View>
                    <Text style={[
                      styles.deviceStatus,
                      device.isActive ? styles.statusOnlineText : styles.statusOfflineText
                    ]}>
                      {device.isActive ? 'En línea' : 'Desconectado'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#FF5252',
  },
  deviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    minHeight: 36,
  },
  deviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  deviceLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  deviceStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusOnlineText: {
    color: '#4CAF50',
  },
  statusOfflineText: {
    color: '#FF5252',
  },
});
