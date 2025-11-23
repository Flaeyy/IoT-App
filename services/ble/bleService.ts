import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { AppLogger } from '@/utils/logger';
import type { ESP32Device } from '../devices/device.types';
import * as base64 from 'base64-js';

// UUIDs del servicio BLE del ESP32
const WIFI_SERVICE_UUID = '000000ff-0000-1000-8000-00805f9b34fb';
const SSID_CHAR_UUID = '0000ff01-0000-1000-8000-00805f9b34fb';
const PASSWORD_CHAR_UUID = '0000ff02-0000-1000-8000-00805f9b34fb';
const ESP32_ID_CHAR_UUID = '0000ff04-0000-1000-8000-00805f9b34fb';

class BLEService {
  private manager: BleManager | null = null;
  private connectedDevice: Device | null = null;

  constructor() {
    // Inicialización lazy - se crea cuando se necesita
  }

  /**
   * Inicializa el BleManager si no existe
   */
  private getManager(): BleManager {
    if (!this.manager) {
      this.manager = new BleManager();
    }
    return this.manager;
  }

  /**
   * Solicita permisos de Bluetooth en Android
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android < 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true; // iOS maneja permisos automáticamente
  }

  /**
   * Escanea dispositivos BLE cercanos
   */
  async scanForDevices(
    onDeviceFound: (device: ESP32Device) => void,
    durationMs: number = 10000
  ): Promise<void> {
    try {
      AppLogger.log('Iniciando escaneo BLE...');

      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Permisos de Bluetooth no otorgados');
      }

      const manager = this.getManager();
      const state = await manager.state();
      AppLogger.log(`Estado de Bluetooth: ${state}`);
      
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth no está encendido');
      }

      const foundDevices = new Map<string, ESP32Device>();

      AppLogger.log('Escaneando todos los dispositivos BLE...');
      
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          AppLogger.error('Error en escaneo BLE', error.message);
          return;
        }

        if (device) {
          // Log de todos los dispositivos encontrados para debugging
          if (device.name) {
            AppLogger.debug(`Dispositivo encontrado: ${device.name} (${device.id}) RSSI: ${device.rssi}`);
          }

          // Buscar dispositivos que contengan "SmartSecurity" en el nombre
          // o "ESP32" o que tengan nuestro servicio UUID
          const matchesName = device.name?.toLowerCase().includes('smartsecurity') || 
                             device.name?.toLowerCase().includes('esp32');
          
          if (matchesName && !foundDevices.has(device.id)) {
            const esp32Device: ESP32Device = {
              id: device.id,
              name: device.name,
              rssi: device.rssi || undefined,
            };
            
            foundDevices.set(device.id, esp32Device);
            onDeviceFound(esp32Device);
            AppLogger.success(`✅ Dispositivo ESP32 encontrado: ${device.name}`);
          }
        }
      });

      // Detener escaneo después del tiempo especificado
      setTimeout(() => {
        this.getManager().stopDeviceScan();
        AppLogger.log('Escaneo BLE detenido');
      }, durationMs);
    } catch (error: any) {
      AppLogger.error('Error al escanear dispositivos', error.message);
      throw error;
    }
  }

  /**
   * Conecta a un dispositivo ESP32
   */
  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      AppLogger.log(`Conectando a dispositivo ${deviceId}...`);

      const manager = this.getManager();
      const device = await manager.connectToDevice(deviceId, {
        requestMTU: 512,
      });

      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;

      AppLogger.success('Conectado al dispositivo', device.name);
      return device;
    } catch (error: any) {
      AppLogger.error('Error al conectar', error.message);
      throw error;
    }
  }

  /**
   * Lee el MAC Address del ESP32
   */
  async readESP32MacAddress(device: Device): Promise<string> {
    try {
      AppLogger.log('Leyendo MAC Address del ESP32...');

      const characteristic = await device.readCharacteristicForService(
        WIFI_SERVICE_UUID,
        ESP32_ID_CHAR_UUID
      );

      if (!characteristic.value) {
        throw new Error('No se pudo leer el MAC Address');
      }

      // Decodificar base64 a bytes
      const bytes = base64.toByteArray(characteristic.value);
      
      // Convertir bytes a string
      let macAddress = '';
      for (let i = 0; i < bytes.length; i++) {
        macAddress += String.fromCharCode(bytes[i]);
      }
      
      AppLogger.success('MAC Address leído', macAddress);

      return macAddress;
    } catch (error: any) {
      AppLogger.error('Error al leer MAC Address', error.message);
      throw error;
    }
  }

  /**
   * Envía credenciales WiFi al ESP32
   */
  async sendWiFiCredentials(device: Device, ssid: string, password: string): Promise<void> {
    try {
      AppLogger.log('Enviando credenciales WiFi al ESP32...');

      // Convertir strings a base64
      const ssidBase64 = this.stringToBase64(ssid);
      const passwordBase64 = this.stringToBase64(password);

      // Enviar SSID
      await device.writeCharacteristicWithResponseForService(
        WIFI_SERVICE_UUID,
        SSID_CHAR_UUID,
        ssidBase64
      );

      // Enviar password
      await device.writeCharacteristicWithResponseForService(
        WIFI_SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        passwordBase64
      );

      AppLogger.success('Credenciales WiFi enviadas exitosamente');
    } catch (error: any) {
      AppLogger.error('Error al enviar credenciales WiFi', error.message);
      throw error;
    }
  }

  /**
   * Convierte un string a base64
   */
  private stringToBase64(str: string): string {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    
    // Convertir bytes a base64 manualmente
    let base64 = '';
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    for (let i = 0; i < bytes.length; i += 3) {
      const byte1 = bytes[i];
      const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      
      const encoded1 = byte1 >> 2;
      const encoded2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
      const encoded3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
      const encoded4 = byte3 & 0x3f;
      
      base64 += base64Chars[encoded1];
      base64 += base64Chars[encoded2];
      base64 += i + 1 < bytes.length ? base64Chars[encoded3] : '=';
      base64 += i + 2 < bytes.length ? base64Chars[encoded4] : '=';
    }
    
    return base64;
  }

  /**
   * Desconecta del dispositivo actual
   */
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
        AppLogger.log('Desconectado del dispositivo');
        this.connectedDevice = null;
      } catch (error: any) {
        AppLogger.error('Error al desconectar', error.message);
      }
    }
  }

  /**
   * Detiene el escaneo BLE
   */
  stopScan(): void {
    if (this.manager) {
      this.manager.stopDeviceScan();
      AppLogger.log('Escaneo BLE detenido manualmente');
    }
  }

  /**
   * Destruye el manager BLE
   */
  destroy(): void {
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
  }
}

export const bleService = new BLEService();
