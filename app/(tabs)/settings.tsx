import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/auth/useAuth';
import { AppLogger } from '@/utils/logger';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoArmEnabled, setAutoArmEnabled] = useState(false);
  
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              AppLogger.auth('Usuario cerrando sesión desde configuración');
              await logout();
              AppLogger.success('Sesión cerrada exitosamente');
              router.replace('/login');
            } catch (error) {
              AppLogger.error('Error al cerrar sesión', error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.title}>Configuracion</Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <IconSymbol name="bell.fill" size={24} color="#FFFFFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notificaciones Push</Text>
                <Text style={styles.settingDescription}>Recibe alertas en tu dispositivo</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#1E4D6B' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <IconSymbol name="speaker.wave.2.fill" size={24} color="#FFFFFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Alerta de Sonido</Text>
                <Text style={styles.settingDescription}>Reproducir sonido para notificaciones</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#767577', true: '#1E4D6B' }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <IconSymbol name="clock.fill" size={24} color="#FFFFFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Auto-Encendido</Text>
                <Text style={styles.settingDescription}>Encender automáticamente por la noche</Text>
              </View>
            </View>
            <Switch
              value={autoArmEnabled}
              onValueChange={setAutoArmEnabled}
              trackColor={{ false: '#767577', true: '#1E4D6B' }}
              thumbColor={autoArmEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <IconSymbol name="key.fill" size={24} color="#FFFFFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Cambiar PIN</Text>
                <Text style={styles.settingDescription}>Actualizar tu PIN de seguridad</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispositivos</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/link-device')}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="link.circle.fill" size={24} color="#FFFFFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Vincular ESP32</Text>
                <Text style={styles.settingDescription}>Conecta tu dispositivo SmartSecurity</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistema</Text>
          
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <IconSymbol name="info.circle.fill" size={24} color="#FFFFFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Acerca de</Text>
                <Text style={styles.settingDescription}>Version 1.0.0</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <IconSymbol name="questionmark.circle.fill" size={24} color="#FFFFFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Ayuda y Soporte</Text>
                <Text style={styles.settingDescription}>Obtén asistencia</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square.fill" size={24} color="#FFFFFF" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    opacity: 0.9,
  },
  settingItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
});
