import AsyncStorage from '@react-native-async-storage/async-storage';

export enum DeviceMode {
  AUTOMATIC = 'automatic',
  DISABLED = 'disabled',
  ACTIVE = 'active',
}

const DEVICE_MODE_PREFIX = '@device_mode:';

/**
 * Guarda el modo de operación de un dispositivo en el almacenamiento local
 */
export const saveDeviceMode = async (macAddress: string, mode: DeviceMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${DEVICE_MODE_PREFIX}${macAddress}`, mode);
    console.log(`✓ Modo ${mode} guardado para dispositivo ${macAddress}`);
  } catch (error) {
    console.error('Error al guardar modo del dispositivo:', error);
    throw error;
  }
};

/**
 * Obtiene el modo de operación de un dispositivo desde el almacenamiento local
 */
export const getDeviceMode = async (macAddress: string): Promise<DeviceMode> => {
  try {
    const mode = await AsyncStorage.getItem(`${DEVICE_MODE_PREFIX}${macAddress}`);
    return mode ? (mode as DeviceMode) : DeviceMode.AUTOMATIC;
  } catch (error) {
    console.error('Error al obtener modo del dispositivo:', error);
    return DeviceMode.AUTOMATIC; // Retornar modo por defecto en caso de error
  }
};

/**
 * Elimina el modo de operación de un dispositivo del almacenamiento local
 */
export const clearDeviceMode = async (macAddress: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${DEVICE_MODE_PREFIX}${macAddress}`);
    console.log(`✓ Modo eliminado para dispositivo ${macAddress}`);
  } catch (error) {
    console.error('Error al eliminar modo del dispositivo:', error);
    throw error;
  }
};

/**
 * Obtiene todos los modos de dispositivos guardados
 */
export const getAllDeviceModes = async (): Promise<Record<string, DeviceMode>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const deviceModeKeys = keys.filter(key => key.startsWith(DEVICE_MODE_PREFIX));
    
    const modes: Record<string, DeviceMode> = {};
    
    for (const key of deviceModeKeys) {
      const macAddress = key.replace(DEVICE_MODE_PREFIX, '');
      const mode = await getDeviceMode(macAddress);
      modes[macAddress] = mode;
    }
    
    return modes;
  } catch (error) {
    console.error('Error al obtener todos los modos de dispositivos:', error);
    return {};
  }
};
