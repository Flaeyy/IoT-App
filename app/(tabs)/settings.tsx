import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoArmEnabled, setAutoArmEnabled] = useState(false);

  return (
    <View style={styles.container}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B9BC4',
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
});
