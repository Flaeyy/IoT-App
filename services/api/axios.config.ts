import axios from 'axios';
import { tokenStorage } from '../storage/tokenStorage';
import { AppLogger } from '@/utils/logger';

// URL base del backend - ajusta esto según tu configuración
const API_BASE_URL = 'http://192.168.2.142:3000';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para controlar si se está refrescando el token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para agregar el token de autenticación a las peticiones
apiClient.interceptors.request.use(
  async (config) => {
    // Obtener el token del storage
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      AppLogger.debug('Token agregado a la petición');
    }
    
    // Log de la petición
    AppLogger.api(
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      config.data
    );
    
    return config;
  },
  (error) => {
    AppLogger.error('Error en interceptor de request', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    // Log de respuesta exitosa
    AppLogger.apiResponse(
      response.status,
      response.config.url || '',
      response.data
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log del error
    if (error.response) {
      AppLogger.apiResponse(
        error.response.status,
        error.config?.url || '',
        error.response.data
      );
    } else {
      AppLogger.error('Error de red o servidor no disponible', error.message);
    }

    // Rutas que NO deben intentar refrescar el token
    const noRefreshUrls = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/check-token'];
    const isNoRefreshUrl = noRefreshUrls.some(url => originalRequest.url?.includes(url));

    // Si el error es 401 y no es una ruta de autenticación
    if (error.response?.status === 401 && !originalRequest._retry && !isNoRefreshUrl) {
      if (isRefreshing) {
        AppLogger.debug('Ya se está refrescando el token, agregando a la cola');
        // Si ya se está refrescando, agregar la petición a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        AppLogger.auth('Token expirado, intentando refrescar...');
        
        // Obtener el refresh token
        const refreshToken = await tokenStorage.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Intentar refrescar el token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Guardar los nuevos tokens
        await tokenStorage.saveAccessToken(access_token);
        await tokenStorage.saveRefreshToken(refresh_token);

        AppLogger.success('Token refrescado automáticamente');

        // Actualizar el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Procesar la cola de peticiones pendientes
        processQueue(null, access_token);

        // Reintentar la petición original
        return apiClient(originalRequest);
      } catch (refreshError) {
        AppLogger.error('Error al refrescar token, limpiando sesión', refreshError);
        // Si falla el refresh, limpiar tokens y procesar la cola con error
        processQueue(refreshError, null);
        await tokenStorage.clearAuthData();
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL };

