import { apiClient } from '../api/axios.config';
import { AppLogger } from '@/utils/logger';
import { DeviceMode } from '../storage/deviceModeStorage';
import type { DeviceResponse, RegisterDeviceDto } from './device.types';

class DeviceService {
  /**
   * Registra un nuevo dispositivo ESP32
   */
  async registerDevice(data: RegisterDeviceDto): Promise<DeviceResponse> {
    try {
      AppLogger.api('POST', '/devices/register', data);
      const response = await apiClient.post<DeviceResponse>('/devices/register', data);
      AppLogger.success('Dispositivo registrado exitosamente', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al registrar dispositivo', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene todos los dispositivos del usuario
   */
  async getUserDevices(): Promise<DeviceResponse[]> {
    try {
      AppLogger.api('GET', '/devices');
      const response = await apiClient.get<DeviceResponse[]>('/devices');
      AppLogger.success('Dispositivos obtenidos', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al obtener dispositivos', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene un dispositivo por ID
   */
  async getDevice(id: number): Promise<DeviceResponse> {
    try {
      AppLogger.api('GET', `/devices/${id}`);
      const response = await apiClient.get<DeviceResponse>(`/devices/${id}`);
      AppLogger.success('Dispositivo obtenido', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al obtener dispositivo', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene un dispositivo por MAC Address
   */
  async getDeviceByMac(macAddress: string): Promise<DeviceResponse> {
    try {
      AppLogger.api('GET', `/devices/mac/${macAddress}`);
      const response = await apiClient.get<DeviceResponse>(`/devices/mac/${macAddress}`);
      AppLogger.success('Dispositivo encontrado por MAC', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al buscar dispositivo por MAC', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza un dispositivo
   */
  async updateDevice(id: number, data: { name?: string; isActive?: boolean }): Promise<DeviceResponse> {
    try {
      AppLogger.api('PATCH', `/devices/${id}`, data);
      const response = await apiClient.patch<DeviceResponse>(`/devices/${id}`, data);
      AppLogger.success('Dispositivo actualizado', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al actualizar dispositivo', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Elimina un dispositivo
   */
  async deleteDevice(id: number): Promise<void> {
    try {
      AppLogger.api('DELETE', `/devices/${id}`);
      await apiClient.delete(`/devices/${id}`);
      AppLogger.success('Dispositivo eliminado');
    } catch (error: any) {
      AppLogger.error('Error al eliminar dispositivo', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Desactiva la alarma de un dispositivo
   */
  async deactivateAlarm(macAddress: string): Promise<{ message: string; success: boolean }> {
    try {
      AppLogger.api('POST', `/devices/${macAddress}/deactivate-alarm`);
      const response = await apiClient.post<{ message: string; success: boolean }>(
        `/devices/${macAddress}/deactivate-alarm`
      );
      AppLogger.success('Alarma desactivada', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al desactivar alarma', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza el modo de operación de un dispositivo
   */
  async updateDeviceMode(macAddress: string, mode: DeviceMode): Promise<{ message: string; mode: DeviceMode }> {
    try {
      AppLogger.api('PUT', `/devices/${macAddress}/mode`, { mode });
      const response = await apiClient.put<{ message: string; mode: DeviceMode }>(
        `/devices/${macAddress}/mode`,
        { mode }
      );
      AppLogger.success('Modo del dispositivo actualizado', response.data);
      return response.data;
    } catch (error: any) {
      AppLogger.error('Error al actualizar modo del dispositivo', error.message);
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

export const deviceService = new DeviceService();
