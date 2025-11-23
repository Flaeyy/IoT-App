# Servicio de Autenticación - IoT App

Este directorio contiene el servicio de autenticación para la aplicación IoT.

## Estructura

```
services/
├── api/
│   └── axios.config.ts    # Configuración de Axios con interceptores
└── auth/
    ├── authService.ts     # Servicio principal de autenticación
    ├── auth.types.ts      # Tipos e interfaces TypeScript
    └── index.ts           # Exportaciones públicas
```

## Configuración

### URL del Backend

Edita el archivo `services/api/axios.config.ts` y actualiza la constante `API_BASE_URL` con la URL de tu backend:

```typescript
const API_BASE_URL = 'http://tu-servidor.com:3000';
```

## Uso

### Importar el servicio

```typescript
import { authService } from '@/services/auth';
// o
import authService from '@/services/auth/authService';
```

### Ejemplos de uso

#### Registro de usuario

```typescript
import { authService, CreateUserDto } from '@/services/auth';

const handleRegister = async () => {
  try {
    const userData: CreateUserDto = {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'securePassword123',
      firstName: 'John',
      lastName: 'Doe',
      deviceId: 'device-unique-id', // Opcional
      deviceType: 'mobile', // Opcional
    };

    const response = await authService.register(userData);
    
    console.log('Usuario registrado:', response.user);
    console.log('Access Token:', response.access_token);
    console.log('Refresh Token:', response.refresh_token);
    
    // Guardar tokens en AsyncStorage o SecureStore
    await saveTokens(response.access_token, response.refresh_token);
  } catch (error) {
    console.error('Error al registrar:', error.message);
  }
};
```

#### Login

```typescript
import { authService, LoginDto } from '@/services/auth';

const handleLogin = async () => {
  try {
    const credentials: LoginDto = {
      username: 'john_doe',
      password: 'securePassword123',
      deviceId: 'device-unique-id', // Opcional
      deviceType: 'mobile', // Opcional
    };

    const response = await authService.login(credentials);
    
    console.log('Usuario autenticado:', response.user);
    
    // Guardar tokens
    await saveTokens(response.access_token, response.refresh_token);
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
  }
};
```

#### Refrescar token

```typescript
import { authService, RefreshTokenDto } from '@/services/auth';

const handleRefreshToken = async () => {
  try {
    const refreshData: RefreshTokenDto = {
      refreshToken: 'tu-refresh-token-guardado',
      deviceId: 'device-unique-id', // Opcional
      deviceType: 'mobile', // Opcional
    };

    const response = await authService.refresh(refreshData);
    
    // Actualizar tokens guardados
    await saveTokens(response.access_token, response.refresh_token);
  } catch (error) {
    console.error('Error al refrescar token:', error.message);
    // Redirigir al login si el refresh falla
  }
};
```

#### Logout

```typescript
import { authService } from '@/services/auth';

const handleLogout = async () => {
  try {
    const refreshToken = await getRefreshToken(); // Obtener del storage
    
    const response = await authService.logout(refreshToken);
    console.log(response.message);
    
    // Limpiar tokens del storage
    await clearTokens();
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
  }
};
```

#### Logout de todos los dispositivos

```typescript
import { authService } from '@/services/auth';

const handleLogoutAll = async () => {
  try {
    const accessToken = await getAccessToken(); // Obtener del storage
    
    const response = await authService.logoutAll(accessToken);
    console.log(response.message);
    
    // Limpiar tokens del storage
    await clearTokens();
  } catch (error) {
    console.error('Error al cerrar todas las sesiones:', error.message);
  }
};
```

## Tipos disponibles

### CreateUserDto
```typescript
interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  deviceId?: string;
  deviceType?: string;
}
```

### LoginDto
```typescript
interface LoginDto {
  username: string;
  password: string;
  deviceId?: string;
  deviceType?: string;
}
```

### RefreshTokenDto
```typescript
interface RefreshTokenDto {
  refreshToken: string;
  deviceId?: string;
  deviceType?: string;
}
```

### AuthResponse
```typescript
interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}
```

### User
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Interceptores de Axios

El archivo `axios.config.ts` incluye interceptores para:

1. **Request Interceptor**: Agregar automáticamente el token de autenticación a las peticiones
2. **Response Interceptor**: Manejar errores 401 y refrescar el token automáticamente

Para implementar la funcionalidad completa de los interceptores, deberás:

1. Implementar funciones para guardar/obtener tokens del storage
2. Descomentar y adaptar el código en los interceptores

## Manejo de errores

Todos los métodos del servicio incluyen manejo de errores que devuelve mensajes descriptivos:

- **Error de servidor**: Incluye el mensaje del backend y el código de estado
- **Error de conexión**: Indica problemas de red
- **Otros errores**: Mensaje genérico del error

## Próximos pasos

1. Configurar AsyncStorage o Expo SecureStore para guardar tokens
2. Implementar la lógica de refresh automático en los interceptores
3. Crear un contexto de autenticación (AuthContext) para manejar el estado global
4. Implementar navegación condicional basada en el estado de autenticación
