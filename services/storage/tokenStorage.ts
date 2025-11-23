import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../auth/auth.types';
import { AppLogger } from '@/utils/logger';

// Claves para el almacenamiento
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@smart_security:access_token',
  REFRESH_TOKEN: '@smart_security:refresh_token',
  USER_DATA: '@smart_security:user_data',
};

/**
 * Servicio para gestionar el almacenamiento de tokens y datos del usuario
 */
class TokenStorage {
  /**
   * Guarda el access token
   */
  async saveAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error guardando access token:', error);
      throw error;
    }
  }

  /**
   * Obtiene el access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error obteniendo access token:', error);
      return null;
    }
  }

  /**
   * Guarda el refresh token
   */
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error guardando refresh token:', error);
      throw error;
    }
  }

  /**
   * Obtiene el refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error obteniendo refresh token:', error);
      return null;
    }
  }

  /**
   * Guarda los datos del usuario
   */
  async saveUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error guardando datos del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene los datos del usuario
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  }

  /**
   * Guarda todos los datos de autenticación de una vez
   */
  async saveAuthData(accessToken: string, refreshToken: string, user: User): Promise<void> {
    try {
      AppLogger.storage('SAVE', 'auth_data', { username: user.username });
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      ]);
      AppLogger.success('Datos de autenticación guardados');
    } catch (error) {
      AppLogger.error('Error guardando datos de autenticación', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los datos de autenticación
   */
  async getAuthData(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
  }> {
    try {
      AppLogger.storage('GET', 'auth_data');
      const values = await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      const result = {
        accessToken: values[0][1],
        refreshToken: values[1][1],
        user: values[2][1] ? JSON.parse(values[2][1]) : null,
      };

      if (result.user) {
        AppLogger.success('Datos de autenticación recuperados', { username: result.user.username });
      } else {
        AppLogger.debug('No hay datos de autenticación guardados');
      }

      return result;
    } catch (error) {
      AppLogger.error('Error obteniendo datos de autenticación', error);
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    }
  }

  /**
   * Elimina todos los datos de autenticación
   */
  async clearAuthData(): Promise<void> {
    try {
      AppLogger.storage('CLEAR', 'auth_data');
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      AppLogger.success('Datos de autenticación eliminados');
    } catch (error) {
      AppLogger.error('Error eliminando datos de autenticación', error);
      throw error;
    }
  }
}

// Exportar instancia única
export const tokenStorage = new TokenStorage();
export default tokenStorage;
