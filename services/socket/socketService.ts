import { io, Socket } from 'socket.io-client';
import { AppLogger } from '@/utils/logger';
import type { Event } from '../events/event.types';

// URL del backend - ajustar según configuración
const SOCKET_URL = 'http://192.168.100.7:3000';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Conecta al servidor WebSocket
   */
  connect(userId: string) {
    if (this.socket?.connected) {
      AppLogger.log('Socket ya conectado');
      return;
    }

    this.userId = userId;

    AppLogger.log('Conectando a WebSocket...', { url: SOCKET_URL, userId });

    this.socket = io(`${SOCKET_URL}/events`, {
      auth: {
        userId: userId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Configura los listeners de eventos del socket
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      AppLogger.success('✓ Conectado a WebSocket', { socketId: this.socket?.id });
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      AppLogger.warn('Desconectado de WebSocket', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      AppLogger.error('Error de conexión WebSocket', {
        error: error.message,
        attempt: this.reconnectAttempts,
      });

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        AppLogger.error('Máximo de reintentos alcanzado, deteniendo reconexión');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      AppLogger.success('Reconectado a WebSocket', { attempt: attemptNumber });
    });
  }

  /**
   * Escucha eventos de movimiento para el usuario actual
   */
  onMotionEvent(callback: (event: Event) => void) {
    if (!this.socket || !this.userId) {
      AppLogger.error('Socket no conectado o userId no definido');
      return;
    }

    const eventName = `motion:${this.userId}`;
    AppLogger.log(`Escuchando eventos: ${eventName}`);

    this.socket.on(eventName, (data: Event) => {
      AppLogger.log('🚨 Evento de movimiento recibido', data);
      callback(data);
    });
  }

  /**
   * Escucha cambios en el estado de alarma
   */
  onAlarmStatus(callback: (data: { deviceMac: string; alarmActive: boolean; timestamp: number }) => void) {
    if (!this.socket || !this.userId) {
      AppLogger.error('Socket no conectado o userId no definido');
      return;
    }

    const eventName = `alarm:${this.userId}`;
    AppLogger.log(`Escuchando alarmas: ${eventName}`);

    this.socket.on(eventName, (data) => {
      AppLogger.log('🔔 Estado de alarma recibido', data);
      callback(data);
    });
  }

  /**
   * Escucha cambios en el estado del dispositivo
   */
  onDeviceStatus(callback: (data: any) => void) {
    if (!this.socket || !this.userId) {
      AppLogger.error('Socket no conectado o userId no definido');
      return;
    }

    const eventName = `device:${this.userId}`;
    AppLogger.log(`Escuchando dispositivos: ${eventName}`);

    this.socket.on(eventName, (data) => {
      AppLogger.log('📡 Estado de dispositivo recibido', data);
      callback(data);
    });
  }

  /**
   * Escucha cualquier evento genérico
   */
  onEvent(callback: (data: { type: string; data: any }) => void) {
    if (!this.socket || !this.userId) {
      AppLogger.error('Socket no conectado o userId no definido');
      return;
    }

    const eventName = `event:${this.userId}`;
    AppLogger.log(`Escuchando eventos genéricos: ${eventName}`);

    this.socket.on(eventName, (data) => {
      AppLogger.log('📨 Evento genérico recibido', data);
      callback(data);
    });
  }

  /**
   * Elimina un listener específico
   */
  off(eventName: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(eventName, callback);
    } else {
      this.socket.off(eventName);
    }
  }

  /**
   * Desconecta el socket
   */
  disconnect() {
    if (this.socket) {
      AppLogger.log('Desconectando WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Verifica si el socket está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtiene el socket instance (para uso avanzado)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Exportar instancia singleton
export const socketService = new SocketService();
