import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { bleService } from '@/services/ble/bleService';
import { deviceService } from '@/services/devices/deviceService';
import type { ESP32Device } from '@/services/devices/device.types';
import { AppLogger } from '@/utils/logger';
import type { Device } from 'react-native-ble-plx';

export default function LinkDeviceScreen() {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<ESP32Device[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  
  // Estados para el formulario WiFi
  const [showWiFiForm, setShowWiFiForm] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [sendingWiFi, setSendingWiFi] = useState(false);

  const handleScanDevices = async () => {
    try {
      setScanning(true);
      setDevices([]);
      AppLogger.log('Iniciando escaneo de dispositivos ESP32...');

      await bleService.scanForDevices(
        (device) => {
          setDevices((prev) => {
            const exists = prev.find((d) => d.id === device.id);
            if (!exists) {
              return [...prev, device];
            }
            return prev;
          });
        },
        10000 // 10 segundos de escaneo
      );

      setTimeout(() => {
        setScanning(false);
        AppLogger.log('Escaneo completado');
      }, 10000);
    } catch (error: any) {
      setScanning(false);
      AppLogger.error('Error al escanear', error.message);
      Alert.alert('Error', error.message || 'No se pudo escanear dispositivos');
    }
  };

  const handleConnectDevice = async (device: ESP32Device) => {
    try {
      setConnecting(device.id);
      AppLogger.log(`Conectando a ${device.name}...`);

      // Conectar al dispositivo
      const connectedDevice = await bleService.connectToDevice(device.id);

      // Leer el MAC Address del ESP32
      const macAddress = await bleService.readESP32MacAddress(connectedDevice);

      AppLogger.success('MAC Address obtenido', macAddress);

      // Registrar el dispositivo en el backend
      await deviceService.registerDevice({
        macAddress,
        name: device.name || 'ESP32 SmartSecurity',
      });

      setConnecting(null);
      
      // Guardar el dispositivo conectado y mostrar formulario WiFi
      setConnectedDevice(connectedDevice);
      setShowWiFiForm(true);

      AppLogger.success('Dispositivo vinculado, listo para configurar WiFi');
    } catch (error: any) {
      setConnecting(null);
      AppLogger.error('Error al vincular dispositivo', error.message);
      
      let errorMessage = 'No se pudo vincular el dispositivo';
      if (error.message.includes('ya está registrado')) {
        errorMessage = 'Este dispositivo ya está registrado con otro usuario';
      }
      
      Alert.alert('Error', errorMessage);
      await bleService.disconnect();
    }
  };

  const handleSendWiFiCredentials = async () => {
    if (!wifiSSID.trim() || !wifiPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa el SSID y la contraseña');
      return;
    }

    if (!connectedDevice) {
      Alert.alert('Error', 'No hay dispositivo conectado');
      return;
    }

    try {
      setSendingWiFi(true);
      AppLogger.log('Enviando credenciales WiFi al ESP32...');

      await bleService.sendWiFiCredentials(connectedDevice, wifiSSID, wifiPassword);

      AppLogger.success('Credenciales WiFi enviadas exitosamente');

      // Esperar un poco para que el ESP32 procese las credenciales
      AppLogger.log('Esperando confirmación del ESP32...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Desconectar del dispositivo
      await bleService.disconnect();

      setSendingWiFi(false);
      setShowWiFiForm(false);
      setConnectedDevice(null);
      setWifiSSID('');
      setWifiPassword('');
      setDevices([]);

      Alert.alert(
        'Éxito',
        `Dispositivo configurado exitosamente\n\nEl ESP32 se conectará a la red WiFi "${wifiSSID}"`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      setSendingWiFi(false);
      AppLogger.error('Error al enviar credenciales WiFi', error.message);
      Alert.alert('Error', 'No se pudieron enviar las credenciales WiFi');
    }
  };

  const handleCancelWiFiForm = async () => {
    await bleService.disconnect();
    setShowWiFiForm(false);
    setConnectedDevice(null);
    setWifiSSID('');
    setWifiPassword('');
  };

  const renderDevice = ({ item }: { item: ESP32Device }) => {
    const isConnecting = connecting === item.id;

    return (
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => handleConnectDevice(item)}
        disabled={isConnecting || connecting !== null}
        activeOpacity={0.7}>
        <View style={styles.deviceInfo}>
          <IconSymbol name="wifi" size={32} color="#FFFFFF" />
          <View style={styles.deviceText}>
            <Text style={styles.deviceName}>{item.name || 'ESP32'}</Text>
            <Text style={styles.deviceDetails}>
              Señal: {item.rssi ? `${item.rssi} dBm` : 'N/A'}
            </Text>
          </View>
        </View>
        {isConnecting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <IconSymbol name="chevron.right" size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Vincular ESP32</Text>
        <Text style={styles.subtitle}>
          Busca y conecta tu dispositivo SmartSecurity
        </Text>
      </View>

      <View style={styles.content}>
        {!scanning && devices.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="antenna.radiowaves.left.and.right" size={80} color="#FFFFFF" />
            <Text style={styles.emptyText}>
              Presiona el botón para buscar dispositivos cercanos
            </Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              scanning ? (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.scanningText}>Buscando dispositivos...</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
          onPress={handleScanDevices}
          disabled={scanning || connecting !== null}
          activeOpacity={0.7}>
          {scanning ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
          )}
          <Text style={styles.scanButtonText}>
            {scanning ? 'Escaneando...' : 'Buscar Dispositivos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para configurar WiFi */}
      <Modal
        visible={showWiFiForm}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelWiFiForm}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
              style={styles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}>
              <View style={styles.modalHeader}>
                <IconSymbol name="wifi" size={48} color="#FFFFFF" />
                <Text style={styles.modalTitle}>Configurar WiFi</Text>
                <Text style={styles.modalSubtitle}>
                  Ingresa las credenciales de tu red WiFi
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <IconSymbol name="network" size={20} color="#FFFFFF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de la red (SSID)"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={wifiSSID}
                    onChangeText={setWifiSSID}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <IconSymbol name="lock.fill" size={20} color="#FFFFFF" />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña WiFi"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={wifiPassword}
                    onChangeText={setWifiPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelWiFiForm}
                    disabled={sendingWiFi}
                    activeOpacity={0.7}>
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleSendWiFiCredentials}
                    disabled={sendingWiFi}
                    activeOpacity={0.7}>
                    {sendingWiFi ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                        <Text style={styles.modalButtonText}>Configurar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  scanningText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  deviceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceText: {
    marginLeft: 16,
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deviceDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 48, 78, 0.9)',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  confirmButton: {
    backgroundColor: 'rgba(8, 48, 78, 0.9)',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
