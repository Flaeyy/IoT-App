import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.title}>Alarma</Text>

      <View style={styles.statusContainer}>
        <View style={[styles.shieldBackground, isArmed && styles.shieldBackgroundArmed]}>
          <View style={styles.shieldIconContainer}>
            <IconSymbol 
              name={isArmed ? "lock.shield.fill" : "checkmark.shield.fill"} 
              size={120} 
              color="#FFFFFF" 
            />
          </View>
        </View>
        
        <Text style={styles.statusText}>
          {isArmed ? 'Armed' : 'Disarmed'}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.armButton]}
          onPress={handleArm}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Endener</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.disarmButton]}
          onPress={handleDisarm}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Apagar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B9BC4',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 60,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  shieldBackground: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  shieldBackgroundArmed: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
  },
  shieldIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 40,
    gap: 20,
  },
  button: {
    width: '100%',
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  armButton: {
    backgroundColor: '#1E4D6B',
  },
  disarmButton: {
    backgroundColor: '#1E4D6B',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
