// DTOs para registro
export interface CreateUserDto {
  name: string;
  username: string;
  email: string;
  password: string;
  deviceId?: string;
  deviceType?: string;
}

// DTOs para login
export interface LoginDto {
  username: string;
  password: string;
  deviceId?: string;
  deviceType?: string;
}

// DTOs para refresh token
export interface RefreshTokenDto {
  refreshToken: string;
  deviceId?: string;
  deviceType?: string;
}

// Respuesta de usuario (sin contraseña)
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Respuesta de autenticación
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// Respuesta de logout
export interface LogoutResponse {
  message: string;
}
