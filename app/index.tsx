import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/auth';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras carga los datos de autenticación
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0A4D68" />
      </View>
    );
  }

  // Si está autenticado, ir a la app principal
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/alarm" />;
  }

  // Si no está autenticado, ir al login
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
