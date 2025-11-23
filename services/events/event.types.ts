 // Tipos para eventos

export enum EventType {
  MOTION_DETECTED = 'motion_detected',
  DEVICE_ONLINE = 'device_online',
  DEVICE_OFFLINE = 'device_offline',
  DEVICE_ARMED = 'device_armed',
  DEVICE_DISARMED = 'device_disarmed',
}

export interface Event {
  id: string;
  eventType: EventType;
  description: string | null;
  metadata: Record<string, any> | null;
  deviceMac: string;
  userId: string;
  createdAt: string;
}

export interface EventStats {
  totalEvents: number;
  motionEvents: number;
  deviceChanges: number;
  eventsPerDay: Array<{
    date: string;
    count: number;
  }>;
}
