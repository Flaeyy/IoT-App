// Exportar el servicio de autenticación
export { default as authService } from './authService';

// Exportar tipos
export type {
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  User,
  AuthResponse,
  LogoutResponse,
} from './auth.types';
