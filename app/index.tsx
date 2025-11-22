import { Redirect } from 'expo-router';

export default function Index() {
  // Por ahora redirigimos directamente al login
  // Más adelante aquí verificaremos si hay una sesión activa
  return <Redirect href="/login" />;
}
