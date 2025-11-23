import { apiClient } from '../api/axios.config';
import {
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponse,
  LogoutResponse,
} from './auth.types';
import { AppLogger } from '@/utils/logger';

class AuthService {
  /**
   * Registra un nuevo usuario
   * @param createUserDto Datos del usuario a registrar
   * @returns Promesa con la respuesta de autenticación
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    try {
      AppLogger.auth('Iniciando registro', { username: createUserDto.username, email: createUserDto.email });
      const response = await apiClient.post<AuthResponse>('/auth/register', createUserDto);
      AppLogger.success('Registro exitoso', { username: response.data.user.username });
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error en registro', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Inicia sesión con credenciales de usuario
   * @param loginDto Credenciales de login
   * @returns Promesa con la respuesta de autenticación
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      AppLogger.auth('Iniciando login', { username: loginDto.username });
      const response = await apiClient.post<AuthResponse>('/auth/login', loginDto);
      AppLogger.success('Login exitoso', { username: response.data.user.username });
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error en login', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Refresca el access token usando el refresh token
   * @param refreshTokenDto Datos del refresh token
   * @returns Promesa con la respuesta de autenticación con nuevos tokens
   */
  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      AppLogger.auth('Refrescando token');
      const response = await apiClient.post<AuthResponse>('/auth/refresh', refreshTokenDto);
      AppLogger.success('Token refrescado exitosamente');
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al refrescar token', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Cierra la sesión del usuario actual
   * @param refreshToken Token de refresco a revocar
   * @returns Promesa con el mensaje de confirmación
   */
  async logout(refreshToken: string): Promise<LogoutResponse> {
    try {
      AppLogger.auth('Cerrando sesión');
      const response = await apiClient.post<LogoutResponse>('/auth/logout', {
        refreshToken,
      });
      AppLogger.success('Sesión cerrada exitosamente');
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al cerrar sesión', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Cierra todas las sesiones del usuario en todos los dispositivos
   * @param accessToken Token de acceso del usuario
   * @returns Promesa con el mensaje de confirmación
   */
  async logoutAll(accessToken: string): Promise<LogoutResponse> {
    try {
      AppLogger.auth('Cerrando todas las sesiones');
      const response = await apiClient.post<LogoutResponse>(
        '/auth/logout-all',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      AppLogger.success('Todas las sesiones cerradas');
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al cerrar todas las sesiones', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Verifica si el token actual es válido
   * @param accessToken Token de acceso a verificar
   * @returns Promesa con el resultado de la validación
   */
  async checkToken(accessToken: string): Promise<{ valid: boolean; user?: any }> {
    try {
      AppLogger.auth('Verificando validez del token');
      const response = await apiClient.post<{ valid: boolean; user: any }>(
        '/auth/check-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      AppLogger.success('Token válido');
      return response.data;
    } catch (error: any) {
      AppLogger.warn('Token inválido o expirado');
      return { valid: false };
    }
  }

  /**
   * Maneja los errores de las peticiones HTTP
   * @param error Error capturado
   * @returns Error formateado
   */
  private handleError(error: any): Error {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const message = error.response.data?.message || 'Error en la petición';
      const statusCode = error.response.status;
      
      return new Error(`${message} (Status: ${statusCode})`);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      // Algo pasó al configurar la petición
      return new Error(error.message || 'Error desconocido');
    }
  }
}

// Exportar una instancia única del servicio (Singleton)
export const authService = new AuthService();
export default authService;
