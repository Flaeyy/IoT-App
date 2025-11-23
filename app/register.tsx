import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/hooks/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, isLoading, isAuthenticated } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/alarm');
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const result = await register(name, username, email, password);
    
    if (result.success) {
      // Navegación automática, el useEffect se encargará de redirigir
      // cuando isAuthenticated cambie a true
    } else {
      Alert.alert('Error', result.error || 'No se pudo registrar el usuario');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            
            {/* Header con ícono */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <IconSymbol name="person.badge.plus.fill" size={60} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
            </View>

            {/* Formulario */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <IconSymbol name="person.fill" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>

              <View style={styles.inputContainer}>
                <IconSymbol name="at" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de usuario"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoComplete="username"
                />
              </View>

              <View style={styles.inputContainer}>
                <IconSymbol name="envelope.fill" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <IconSymbol name="lock.fill" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  <IconSymbol 
                    name={showPassword ? "eye.fill" : "eye.slash.fill"} 
                    size={20} 
                    color="rgba(255, 255, 255, 0.7)" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <IconSymbol name="lock.fill" size={20} color="#FFFFFF" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}>
                  <IconSymbol 
                    name={showConfirmPassword ? "eye.fill" : "eye.slash.fill"} 
                    size={20} 
                    color="rgba(255, 255, 255, 0.7)" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? (
                  <ActivityIndicator color="#0A4D68" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Registrarse</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.back()}>
                <Text style={styles.loginLinkText}>
                  ¿Ya tienes cuenta?{' '}
                  <Text style={styles.loginLinkBold}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#0A4D68',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loginLinkBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
