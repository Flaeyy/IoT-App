import { apiClient } from '../api/axios.config';
import { AppLogger } from '@/utils/logger';
import type { Event, EventStats } from './event.types';

class EventsService {
  /**
   * Obtiene todos los eventos del usuario
   */
  async getUserEvents(limit: number = 50): Promise<Event[]> {
    try {
      AppLogger.api('GET', `/events?limit=${limit}`);
      const response = await apiClient.get<Event[]>(`/events`, {
        params: { limit },
      });
      AppLogger.success('Eventos obtenidos', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al obtener eventos', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene solo los eventos de movimiento del usuario
   */
  async getMotionEvents(limit: number = 50): Promise<Event[]> {
    try {
      AppLogger.api('GET', `/events/motion?limit=${limit}`);
      const response = await apiClient.get<Event[]>(`/events/motion`, {
        params: { limit },
      });
      AppLogger.success('Eventos de movimiento obtenidos', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al obtener eventos de movimiento', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene todos los eventos de un dispositivo específico
   */
  async getDeviceEvents(macAddress: string, limit: number = 50): Promise<Event[]> {
    try {
      AppLogger.api('GET', `/events/device/${macAddress}?limit=${limit}`);
      const response = await apiClient.get<Event[]>(`/events/device/${macAddress}`, {
        params: { limit },
      });
      AppLogger.success('Eventos del dispositivo obtenidos', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al obtener eventos del dispositivo', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene estadísticas de eventos
   */
  async getEventStats(days: number = 7): Promise<EventStats> {
    try {
      AppLogger.api('GET', `/events/stats?days=${days}`);
      const response = await apiClient.get<EventStats>(`/events/stats`, {
        params: { days },
      });
      AppLogger.success('Estadísticas de eventos obtenidas', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al obtener estadísticas', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Maneja errores de la API
   */
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(error.message || 'Error desconocido');
  }
}

export const eventsService = new EventsService();
