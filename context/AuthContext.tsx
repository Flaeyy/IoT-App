import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-constants';
import { authService } from '@/services/auth';
import { tokenStorage } from '@/services/storage/tokenStorage';
import type { User, CreateUserDto, LoginDto } from '@/services/auth/auth.types';
import { AppLogger } from '@/utils/logger';

// Estado de autenticación
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Contexto de autenticación
interface AuthContextData extends AuthState {
  register: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshAccessToken: () => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => Promise<void>;
  loadAuthData: () => Promise<void>;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
};

// Crear el contexto
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticación global
 * Mantiene el estado de autenticación accesible desde toda la aplicación
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  /**
   * Obtiene información del dispositivo para el registro/login
   */
  const getDeviceInfo = useCallback(() => {
    const deviceId = Device.default.sessionId || 'unknown-device';
    const deviceType = Platform.OS === 'ios' ? 'ios' : 
                       Platform.OS === 'android' ? 'android' : 
                       'web';
    
    return { deviceId, deviceType };
  }, []);

  /**
   * Carga los datos de autenticación desde el almacenamiento
   * y verifica su validez con el backend
   */
  const loadAuthData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const authData = await tokenStorage.getAuthData();
      
      if (authData.accessToken && authData.user) {
        // Verificar validez del token con el backend
        const validation = await authService.checkToken(authData.accessToken);
        
        if (validation.valid) {
          // Token válido, restaurar sesión
          setState({
            user: validation.user || authData.user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Token inválido, intentar refresh si hay refresh token
          if (authData.refreshToken) {
            try {
              const { deviceId, deviceType } = getDeviceInfo();
              const response = await authService.refresh({
                refreshToken: authData.refreshToken,
                deviceId,
                deviceType,
              });
              
              // Guardar nuevos tokens
              await tokenStorage.saveAuthData(
                response.access_token,
                response.refresh_token,
                response.user
              );
              
              setState({
                user: response.user,
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                isLoading: false,
                isAuthenticated: true,
              });
            } catch (refreshError) {
              // Refresh falló, limpiar sesión
              await tokenStorage.clearAuthData();
              setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
            }
          } else {
            // No hay refresh token, limpiar sesión
            await tokenStorage.clearAuthData();
            setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
          }
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error cargando datos de autenticación:', error);
      await tokenStorage.clearAuthData();
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
    }
  }, [getDeviceInfo]);

  /**
   * Registra un nuevo usuario
   */
  const register = useCallback(async (
    name: string,
    username: string,
    email: string,
    password: string
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { deviceId, deviceType } = getDeviceInfo();
      
      const registerData: CreateUserDto = {
        name,
        username,
        email,
        password,
        deviceId,
        deviceType,
      };

      const response = await authService.register(registerData);
      
      // Guardar datos en el almacenamiento
      await tokenStorage.saveAuthData(
        response.access_token,
        response.refresh_token,
        response.user
      );

      // Actualizar estado global
      setState({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true, user: response.user };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error.message || 'Error al registrar usuario';
      return { success: false, error: errorMessage };
    }
  }, [getDeviceInfo]);

  /**
   * Inicia sesión
   */
  const login = useCallback(async (username: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { deviceId, deviceType } = getDeviceInfo();
      
      const loginData: LoginDto = {
        username,
        password,
        deviceId,
        deviceType,
      };

      const response = await authService.login(loginData);
      
      // Guardar datos en el almacenamiento
      await tokenStorage.saveAuthData(
        response.access_token,
        response.refresh_token,
        response.user
      );

      // Actualizar estado global
      setState({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true, user: response.user };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error.message || 'Error al iniciar sesión';
      return { success: false, error: errorMessage };
    }
  }, [getDeviceInfo]);

  /**
   * Cierra la sesión
   */
  const logout = useCallback(async () => {
    try {
      AppLogger.auth('Iniciando proceso de logout');
      
      if (state.refreshToken) {
        AppLogger.log('Llamando al backend para cerrar sesión');
        // Intentar cerrar sesión en el backend
        await authService.logout(state.refreshToken);
        AppLogger.success('Sesión cerrada en el backend');
      } else {
        AppLogger.warn('No hay refreshToken, solo limpiando localmente');
      }
    } catch (error) {
      AppLogger.error('Error al cerrar sesión en el backend', error);
    } finally {
      // Limpiar datos locales independientemente del resultado
      AppLogger.log('Limpiando AsyncStorage');
      await tokenStorage.clearAuthData();
      
      AppLogger.auth('Reseteando estado global de autenticación');
      setState({
        ...initialState,
        isLoading: false,
      });
      
      AppLogger.success('Logout completado - usuario desautenticado');
    }
  }, [state.refreshToken]);

  /**
   * Cierra todas las sesiones
   */
  const logoutAll = useCallback(async () => {
    try {
      if (state.accessToken) {
        await authService.logoutAll(state.accessToken);
      }
    } catch (error) {
      console.error('Error al cerrar todas las sesiones:', error);
    } finally {
      // Limpiar datos locales
      await tokenStorage.clearAuthData();
      
      setState({
        ...initialState,
        isLoading: false,
      });
    }
  }, [state.accessToken]);

  /**
   * Refresca el access token
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      if (!state.refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const { deviceId, deviceType } = getDeviceInfo();

      const response = await authService.refresh({
        refreshToken: state.refreshToken,
        deviceId,
        deviceType,
      });

      // Actualizar tokens
      await tokenStorage.saveAuthData(
        response.access_token,
        response.refresh_token,
        response.user
      );

      setState(prev => ({
        ...prev,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
      }));

      return { success: true };
    } catch (error: any) {
      // Si falla el refresh, cerrar sesión
      await logout();
      return { success: false, error: error.message };
    }
  }, [state.refreshToken, getDeviceInfo, logout]);

  /**
   * Actualiza los datos del usuario
   */
  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      await tokenStorage.saveUserData(updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  }, []);

  // Cargar datos de autenticación al montar el componente
  useEffect(() => {
    loadAuthData();
  }, [loadAuthData]);

  return (
    <AuthContext.Provider
      value={{
        // Estado
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        
        // Acciones
        register,
        login,
        logout,
        logoutAll,
        refreshAccessToken,
        updateUser,
        loadAuthData,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
