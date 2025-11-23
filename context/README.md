# Sistema de Autenticación con Estado Global

El sistema de autenticación ahora utiliza **Context API de React** para mantener un **estado global** accesible desde cualquier parte de la aplicación.

## 📁 Estructura

```
context/
  └── AuthContext.tsx       # Context Provider con estado global

hooks/
  └── auth/
      ├── useAuth.ts        # Hook para consumir el contexto
      └── index.ts

services/
  ├── auth/               # Servicio de autenticación (API calls)
  └── storage/            # Almacenamiento persistente (AsyncStorage)
```

## 🌐 Estado Global

El `AuthProvider` envuelve toda la aplicación y mantiene:

- ✅ **user**: Datos del usuario autenticado
- ✅ **accessToken**: Token de acceso JWT
- ✅ **refreshToken**: Token para refrescar la sesión
- ✅ **isAuthenticated**: Estado de autenticación
- ✅ **isLoading**: Estado de carga

## 🔧 Uso en Cualquier Componente

### Ejemplo básico

```tsx
import { useAuth } from '@/hooks/auth';

function MiComponente() {
  const { user, isAuthenticated, accessToken } = useAuth();

  if (!isAuthenticated) {
    return <Text>No autenticado</Text>;
  }

  return (
    <View>
      <Text>Hola, {user?.firstName}!</Text>
      <Text>Email: {user?.email}</Text>
    </View>
  );
}
```

### Acceder al usuario desde cualquier pantalla

```tsx
import { useAuth } from '@/hooks/auth';

function PerfilScreen() {
  const { user, updateUser } = useAuth();

  return (
    <View>
      <Text>Perfil de {user?.firstName} {user?.lastName}</Text>
      <Text>Usuario: {user?.username}</Text>
      <Text>Email: {user?.email}</Text>
    </View>
  );
}
```

### Hacer peticiones autenticadas

```tsx
import { useAuth } from '@/hooks/auth';
import { apiClient } from '@/services/api/axios.config';

function MisDispositivosScreen() {
  const { accessToken } = useAuth();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function fetchDevices() {
      // El accessToken se agrega automáticamente por los interceptores
      const response = await apiClient.get('/devices');
      setDevices(response.data);
    }
    
    if (accessToken) {
      fetchDevices();
    }
  }, [accessToken]);

  return <DeviceList devices={devices} />;
}
```

### Cerrar sesión

```tsx
import { useAuth } from '@/hooks/auth';
import { router } from 'expo-router';

function ConfigScreen() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View>
      <Text>Usuario: {user?.username}</Text>
      <Button title="Cerrar Sesión" onPress={handleLogout} />
    </View>
  );
}
```

### Cerrar sesión en todos los dispositivos

```tsx
import { useAuth } from '@/hooks/auth';

function SeguridadScreen() {
  const { logoutAll } = useAuth();

  const handleLogoutAllDevices = async () => {
    Alert.alert(
      'Cerrar todas las sesiones',
      '¿Deseas cerrar sesión en todos los dispositivos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cerrar todas',
          onPress: async () => {
            await logoutAll();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <Button 
      title="Cerrar sesión en todos los dispositivos" 
      onPress={handleLogoutAllDevices} 
    />
  );
}
```

### Proteger rutas

```tsx
import { useAuth } from '@/hooks/auth';
import { Redirect } from 'expo-router';

function ProtectedScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <ContenidoProtegido />;
}
```

## 🔄 Flujo Completo de Autenticación

### 1. Login
```tsx
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login('username', 'password');
  
  if (result.success) {
    // ✅ El estado global se actualiza automáticamente
    // ✅ Los tokens se guardan en AsyncStorage
    // ✅ Puedes acceder a user, accessToken, refreshToken desde cualquier componente
    router.replace('/(tabs)/alarm');
  } else {
    Alert.alert('Error', result.error);
  }
};
```

### 2. Registro
```tsx
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register(
    'username',
    'email@example.com',
    'password',
    'John',
    'Doe'
  );
  
  if (result.success) {
    // ✅ Usuario registrado y autenticado automáticamente
    router.replace('/(tabs)/alarm');
  }
};
```

### 3. Verificar autenticación al iniciar la app
```tsx
function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/alarm" />;
  }

  return <Redirect href="/login" />;
}
```

## 📱 Ejemplo Completo: Pantalla con Usuario

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks/auth';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    logout 
  } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ¡Bienvenido, {user?.firstName}!
      </Text>
      
      <View style={styles.userInfo}>
        <Text>Usuario: {user?.username}</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Nombre: {user?.firstName} {user?.lastName}</Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
```

## 🎯 Ventajas del Estado Global

### ✅ Acceso Universal
Puedes acceder al usuario y tokens desde **cualquier componente** sin prop drilling:

```tsx
// En cualquier pantalla o componente
const { user, accessToken } = useAuth();
```

### ✅ Persistencia Automática
Los datos se guardan automáticamente en AsyncStorage y se recuperan al reiniciar la app.

### ✅ Sincronización Automática
Cuando inicias sesión, **todos los componentes** que usan `useAuth()` se actualizan automáticamente.

### ✅ Refresh Token Automático
Los interceptores de Axios refrescan automáticamente el token cuando expira.

## 🔐 API Disponible

```typescript
const {
  // Estado
  user,              // Usuario autenticado
  accessToken,       // Token JWT
  refreshToken,      // Token de refresco
  isAuthenticated,   // true si está autenticado
  isLoading,         // true durante operaciones

  // Métodos
  register,          // Registrar usuario
  login,             // Iniciar sesión
  logout,            // Cerrar sesión
  logoutAll,         // Cerrar en todos los dispositivos
  refreshAccessToken,// Refrescar token manualmente
  updateUser,        // Actualizar datos del usuario
  loadAuthData,      // Recargar desde storage
} = useAuth();
```

## 🚀 Todo Configurado

1. ✅ **AuthProvider** envuelve la aplicación en `app/_layout.tsx`
2. ✅ **Estado global** accesible desde cualquier componente
3. ✅ **Persistencia** con AsyncStorage
4. ✅ **Refresh automático** de tokens
5. ✅ **Login y Register** integrados
6. ✅ **Interceptores de Axios** configurados

¡Ya puedes usar `useAuth()` en cualquier pantalla de tu app! 🎉
