import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Exportar el contexto y el provider
export { AuthContext, AuthProvider } from './AuthContext';

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Exportar tipos si es necesario
export type { User } from '@/services/auth/auth.types';
