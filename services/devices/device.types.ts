export interface ESP32Device {
  id: string;
  name: string | null;
  macAddress?: string;
  rssi?: number;
}

export interface DeviceResponse {
  id: number;
  macAddress: string;
  name: string | null;
  deviceType: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDeviceDto {
  macAddress: string;
  name?: string;
}
