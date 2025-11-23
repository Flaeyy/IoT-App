import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { deviceService } from '@/services/devices/deviceService';

export default function AddDeviceScreen() {
  const [deviceName, setDeviceName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatMacAddress = (text: string) => {
    // Remover caracteres no válidos
    const cleaned = text.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
    
    // Agregar : cada 2 caracteres
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || cleaned;
    
    // Limitar a 17 caracteres (formato XX:XX:XX:XX:XX:XX)
    return formatted.substring(0, 17);
  };

  const handleMacAddressChange = (text: string) => {
    const formatted = formatMacAddress(text);
    setMacAddress(formatted);
  };

  const handleAddDevice = async () => {
    // Validaciones
    if (!deviceName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el dispositivo');
      return;
    }

    if (!macAddress.trim()) {
      Alert.alert('Error', 'Por favor ingresa la dirección MAC del ESP32');
      return;
    }

    // Validar formato de MAC (XX:XX:XX:XX:XX:XX)
    const macRegex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;
    if (!macRegex.test(macAddress)) {
      Alert.alert('Error', 'La dirección MAC debe tener el formato XX:XX:XX:XX:XX:XX');
      return;
    }

    try {
      setIsLoading(true);
      
      // Registrar dispositivo en el backend
      await deviceService.registerDevice({
        macAddress: macAddress,
        name: deviceName,
      });

      Alert.alert(
        'Dispositivo Agregado',
        `"${deviceName}" se ha registrado exitosamente.\n\nAhora aparecerá en tu lista de dispositivos.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo agregar el dispositivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
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
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleCancel}>
                <IconSymbol name="chevron.left" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <View style={styles.iconContainer}>
                  <IconSymbol name="cpu.fill" size={50} color="#FFFFFF" />
                </View>
                <Text style={styles.title}>Agregar Dispositivo</Text>
                <Text style={styles.subtitle}>
                  Configura tu ESP32 para comenzar a usarlo
                </Text>
              </View>
            </View>

            {/* Formulario */}
            <View style={styles.formContainer}>
              {/* Nombre del Dispositivo */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <IconSymbol name="tag.fill" size={16} color="#FFFFFF" />{' '}
                  Nombre del Dispositivo
                </Text>
                <View style={styles.inputContainer}>
                  <IconSymbol 
                    name="pencil" 
                    size={20} 
                    color="#FFFFFF" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Puerta Principal, Cocina, Cuarto"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={deviceName}
                    onChangeText={setDeviceName}
                    maxLength={30}
                  />
                </View>
                <Text style={styles.helperText}>
                  Dale un nombre descriptivo para identificarlo fácilmente
                </Text>
              </View>

              {/* Dirección MAC */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <IconSymbol name="cpu.fill" size={16} color="#FFFFFF" />{' '}
                  Dirección MAC del ESP32
                </Text>
                
                <View style={styles.inputContainer}>
                  <IconSymbol 
                    name="barcode" 
                    size={20} 
                    color="#FFFFFF" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="XX:XX:XX:XX:XX:XX"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={macAddress}
                    onChangeText={handleMacAddressChange}
                    autoCapitalize="characters"
                    maxLength={17}
                  />
                </View>
                
                <Text style={styles.helperText}>
                  Encuentra la MAC en la etiqueta del ESP32 o en el monitor serial
                </Text>
              </View>

              {/* Instrucciones */}
              <View style={styles.instructionsBox}>
                <View style={styles.instructionHeader}>
                  <IconSymbol name="info.circle.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.instructionTitle}>Pasos siguientes:</Text>
                </View>
                <Text style={styles.instructionText}>
                  1. Conecta tu ESP32 a la corriente{'\n'}
                  2. Verifica que el LED encienda{'\n'}
                  3. El dispositivo aparecerá en tu lista
                </Text>
              </View>

              {/* Botones */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAddDevice}
                  disabled={isLoading}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <ActivityIndicator color="#0A4D68" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Agregar Dispositivo</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
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
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    marginBottom: 8,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    height: '100%',
  },
  helperText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    paddingHorizontal: 5,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#FFFFFF',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
