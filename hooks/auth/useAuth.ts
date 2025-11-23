import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación global
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * // Acceder al usuario desde cualquier componente
 * console.log(user?.firstName);
 * 
 * // Iniciar sesión
 * await login('username', 'password');
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
}

export default useAuth;
