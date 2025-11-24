import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { deviceService } from '@/services/devices/deviceService';
import { AppLogger } from '@/utils/logger';

type AlarmStatus = 'armed' | 'disarmed' | 'unknown';

export default function AlarmScreen() {
  const [status, setStatus] = useState<AlarmStatus>('unknown');
  const [loading, setLoading] = useState<boolean>(false);
  const [deviceMac, setDeviceMac] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const devices = await deviceService.getUserDevices();
      if (devices.length > 0) {
        // Usar el primer dispositivo activo
        const activeDevice = devices.find(d => d.isActive) || devices[0];
        setDeviceMac(activeDevice.macAddress);
        setStatus('disarmed');
        AppLogger.log('Dispositivo cargado', { mac: activeDevice.macAddress });
      } else {
        Alert.alert(
          'Sin dispositivos',
          'No tienes dispositivos registrados. Por favor, registra un dispositivo primero.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      AppLogger.error('Error al cargar dispositivos', error);
      Alert.alert('Error', 'No se pudieron cargar los dispositivos');
    }
  };

  const handleArm = () => {
    // La alarma se arma automáticamente cuando el PIR detecta movimiento
    Alert.alert(
      'Información',
      'La alarma se activará automáticamente cuando el sensor PIR detecte movimiento en tu dispositivo ESP32.',
      [{ text: 'Entendido' }]
    );
  };

  const handleDisarm = async () => {
    if (!deviceMac) {
      Alert.alert('Error', 'No hay dispositivo seleccionado');
      return;
    }

    setLoading(true);
    try {
      AppLogger.log('Desactivando alarma', { mac: deviceMac });
      const result = await deviceService.deactivateAlarm(deviceMac);
      
      if (result.success) {
        setStatus('disarmed');
        Alert.alert(
          '✓ Alarma Desactivada',
          'La alarma del buzzer ha sido desactivada exitosamente.',
          [{ text: 'OK' }]
        );
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
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isArmed = status === 'armed';
  const isUnknown = status === 'unknown';

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
      
      <Text style={styles.title}>Alarma</Text>

      <View style={styles.statusContainer}>
        <View style={styles.shieldBackground}>
          {isUnknown ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <IconSymbol 
              name={isArmed ? "lock.shield.fill" : "checkmark.shield.fill"} 
              size={90} 
              color="#FFFFFF" 
            />
          )}
        </View>
        
        <Text style={styles.statusText}>
          {isUnknown ? 'Cargando...' : isArmed ? 'Encendida' : 'Apagada'}
        </Text>
        
        {deviceMac && (
          <Text style={styles.deviceInfo}>
            Dispositivo: {deviceMac}
          </Text>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.infoButton]}
          onPress={handleArm}
          activeOpacity={0.7}
          disabled={isUnknown}
        >
          <Text style={styles.buttonText}>ℹ️ Info Alarma</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleDisarm}
          activeOpacity={0.7}
          disabled={loading || isUnknown}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>🔕 Desactivar Alarma</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
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
  title: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 60,
    letterSpacing: 0.5,
  },
  statusContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 80,
  },
  shieldBackground: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  statusText: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  deviceInfo: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 35,
    gap: 20,
  },
  button: {
    width: '100%',
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 48, 78, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  infoButton: {
    backgroundColor: 'rgba(13, 122, 184, 0.6)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
