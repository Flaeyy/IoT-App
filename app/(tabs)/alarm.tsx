import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AlarmStatus = 'armed' | 'disarmed';

export default function AlarmScreen() {
  const [status, setStatus] = useState<AlarmStatus>('disarmed');

  const handleArm = () => {
    setStatus('armed');
  };

  const handleDisarm = () => {
    setStatus('disarmed');
  };

  const isArmed = status === 'armed';

  return (
    <LinearGradient
      colors={['#0B3D5C', '#1565A0', '#0D7AB8']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.title}>Alarma</Text>

      <View style={styles.statusContainer}>
        <View style={styles.shieldBackground}>
          <IconSymbol 
            name={isArmed ? "lock.shield.fill" : "checkmark.shield.fill"} 
            size={90} 
            color="#FFFFFF" 
          />
        </View>
        
        <Text style={styles.statusText}>
          {isArmed ? 'Encendida' : 'Apagada'}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleArm}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Encender</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleDisarm}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Apagar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 60,
    letterSpacing: 0.5,
  },
  statusContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 80,
  },
  shieldBackground: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  statusText: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 35,
    gap: 20,
  },
  button: {
    width: '100%',
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 48, 78, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
