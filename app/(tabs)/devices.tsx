import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline';
  location: string;
}

// Datos estáticos de dispositivos
const MOCK_DEVICES: Device[] = [
  {
    id: '1',
    name: 'ESP32 Puerta Principal',
    status: 'online',
    location: 'Entrada',
  },
  {
    id: '2',
    name: 'ESP32 Cocina',
    status: 'online',
    location: 'Cocina',
  },
  {
    id: '3',
    name: 'ESP32 Cuarto',
    status: 'offline',
    location: 'Habitación',
  },
];

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);

  const handleAddDevice = () => {
    router.push('/add-device');
  };

  const handleDevicePress = (device: Device) => {
    if (device.status === 'offline') {
      Alert.alert('Dispositivo sin conexión', `${device.name} está desconectado`);
    } else {
      // Navegar a las pantallas de alarma/control del dispositivo
      router.push('/alarm');
    }
  };

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
          showsVerticalScrollIndicator={false}>
          
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
                    device.status === 'online' ? styles.statusOnline : styles.statusOffline
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
                      {device.name}
                    </Text>
                    <View style={styles.deviceDetails}>
                      <IconSymbol 
                        name="location.fill" 
                        size={14} 
                        color="rgba(255, 255, 255, 0.7)" 
                      />
                      <Text style={styles.deviceLocation}>{device.location}</Text>
                    </View>
                    <Text style={[
                      styles.deviceStatus,
                      device.status === 'online' ? styles.statusOnlineText : styles.statusOfflineText
                    ]}>
                      {device.status === 'online' ? 'En línea' : 'Desconectado'}
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
