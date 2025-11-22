import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleRegister = () => {
    // Validaciones
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

    // Por ahora, simulamos un registro exitoso
    // Aquí irá la lógica de registro real más adelante
    Alert.alert(
      'Registro exitoso',
      '¡Tu cuenta ha sido creada!',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Crear Cuenta
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Completa tus datos para registrarte
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                  color: colors.text,
                },
              ]}
              placeholder="Nombre completo"
              placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#999'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                  color: colors.text,
                },
              ]}
              placeholder="Nombre de usuario"
              placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#999'}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                  color: colors.text,
                },
              ]}
              placeholder="Correo electrónico"
              placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#999'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                  color: colors.text,
                },
              ]}
              placeholder="Contraseña"
              placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#999'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                  color: colors.text,
                },
              ]}
              placeholder="Confirmar contraseña"
              placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#999'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.back()}>
              <Text style={[styles.loginLinkText, { color: colors.text }]}>
                ¿Ya tienes cuenta?{' '}
                <Text style={{ color: colors.tint, fontWeight: '600' }}>
                  Inicia sesión
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#080808ff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
  },
});
