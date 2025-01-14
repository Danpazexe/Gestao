import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Configuração das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const SettingsScreen = ({ isDarkMode, setIsDarkMode, navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isBiometricEnabled, setBiometricEnabled] = useState(false);
  const [isAutoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [notificationDays, setNotificationDays] = useState(7);

  useEffect(() => {
    loadSettings();
    checkNotificationPermissions();
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: isDarkMode ? '#1F2937' : '#374151',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#FFFFFF',
      headerTitle: 'Configurações',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      headerTitleAlign: 'center',
    });
  }, [navigation, isDarkMode]);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setIsNotificationsEnabled(parsedSettings.notifications ?? true);
        setBiometricEnabled(parsedSettings.biometric ?? false);
        setAutoBackupEnabled(parsedSettings.autoBackup ?? false);
        setNotificationDays(parsedSettings.notificationDays ?? 7);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const currentSettings = await AsyncStorage.getItem('userSettings');
      const settings = currentSettings ? JSON.parse(currentSettings) : {};
      settings[key] = value;
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    saveSettings('darkMode', !isDarkMode);
  };

  const checkNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Para receber notificações de validade, você precisa permitir as notificações.',
        [{ text: 'OK' }]
      );
      setIsNotificationsEnabled(false);
      return;
    }
  };

  const scheduleExpirationNotifications = async (enabled) => {
    try {
      if (enabled) {
        // Cancela notificações existentes antes de agendar novas
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Busca produtos do AsyncStorage
        const productsJson = await AsyncStorage.getItem('products');
        if (productsJson) {
          const products = JSON.parse(productsJson);
          
          for (const product of products) {
            if (product.expirationDate) {
              const expirationDate = new Date(product.expirationDate);
              const notificationDate = new Date(expirationDate);
              notificationDate.setDate(expirationDate.getDate() - notificationDays); // Notifica X dias antes

              if (notificationDate > new Date()) { // Só agenda se a data ainda não passou
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: "Produto próximo do vencimento!",
                    body: `${product.name} vencerá em ${notificationDays} dias (${product.expirationDate})`,
                    data: { productId: product.id },
                  },
                  trigger: {
                    date: notificationDate,
                  },
                });
              }
            }
          }
        }
      } else {
        // Se desativou as notificações, cancela todas agendadas
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
      Alert.alert('Erro', 'Não foi possível configurar as notificações');
    }
  };

  const toggleNotifications = async () => {
    const newValue = !isNotificationsEnabled;
    setIsNotificationsEnabled(newValue);
    await saveSettings('notifications', newValue);
    await scheduleExpirationNotifications(newValue);
  };

  const toggleBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (compatible && enrolled) {
        // Verifica se existem credenciais salvas
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        
        if (savedEmail && savedPassword) {
          const newValue = !isBiometricEnabled;
          setBiometricEnabled(newValue);
          await AsyncStorage.setItem('biometricEnabled', newValue.toString());
          
          Toast.show({
            type: 'success',
            text1: 'Biometria',
            text2: newValue ? 'Ativada com sucesso!' : 'Desativada com sucesso!',
          });
        } else {
          Alert.alert(
            'Configuração Necessária',
            'Para usar a biometria, você precisa primeiro fazer login e ativar "Lembrar-me"'
          );
        }
      } else {
        Alert.alert(
          'Não Disponível',
          'Seu dispositivo não suporta ou não tem biometria configurada'
        );
      }
    } catch (error) {
      console.error('Erro ao configurar biometria:', error);
      Alert.alert('Erro', 'Não foi possível configurar a biometria');
    }
  };

  const toggleAutoBackup = () => {
    setAutoBackupEnabled(!isAutoBackupEnabled);
    saveSettings('autoBackup', !isAutoBackupEnabled);
  };

  const handleResetData = async () => {
    try {
      await AsyncStorage.clear();
      setIsModalVisible(false);
      Alert.alert('Sucesso', 'Dados redefinidos com sucesso! O app será reiniciado.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'EntryScreen' }],
      });
    } catch (e) {
      console.error('Erro ao redefinir dados', e);
      Alert.alert('Erro', 'Não foi possível redefinir os dados');
    }
  };

  const SettingItem = ({ icon, title, value, onToggle, iconColor }) => (
    <View style={[styles.settingGroup, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.settingItem}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={iconColor || (isDarkMode ? '#fff' : '#374151')}
        />
        <Text style={[styles.settingText, isDarkMode ? styles.darkText : styles.lightText]}>
          {title}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ 
          false: isDarkMode ? "#4B5563" : "#D1D5DB",
          true: isDarkMode ? "#10B981" : "#059669"
        }}
        thumbColor={value ? "#fff" : isDarkMode ? "#1F2937" : "#9CA3AF"}
        ios_backgroundColor={isDarkMode ? "#4B5563" : "#D1D5DB"}
        style={{ transform: [{ scale: 1.1 }] }}
      />
    </View>
  );

  const NavigationItem = ({ icon, title, onPress, iconColor }) => (
    <TouchableOpacity 
      style={[styles.settingGroup, isDarkMode ? styles.darkContainer : styles.lightContainer]}
      onPress={onPress}
    >
      <View style={styles.settingItem}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={iconColor || (isDarkMode ? '#fff' : '#374151')}
        />
        <Text style={[styles.settingText, isDarkMode ? styles.darkText : styles.lightText]}>
          {title}
        </Text>
      </View>
      <MaterialCommunityIcons 
        name="chevron-right" 
        size={24} 
        color={isDarkMode ? '#fff' : '#374151'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
          Aparência e Interface
        </Text>
        
        <SettingItem
          icon="theme-light-dark"
          title="Modo Escuro"
          value={isDarkMode}
          onToggle={toggleDarkMode}
        />

        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
          Notificações e Alertas
        </Text>

        <SettingItem
          icon="bell-outline"
          title="Notificações de Validade"
          value={isNotificationsEnabled}
          onToggle={toggleNotifications}
        />

        <NavigationItem
          icon="clock-outline"
          title="Configurar Validades"
          onPress={() => navigation.navigate('ValiditySettings')}
        />

        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
          Segurança
        </Text>

        <SettingItem
          icon="fingerprint"
          title="Autenticação Biométrica"
          value={isBiometricEnabled}
          onToggle={toggleBiometric}
        />

        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
          Backup e Dados
        </Text>

        <SettingItem
          icon="backup-restore"
          title="Backup Automático"
          value={isAutoBackupEnabled}
          onToggle={toggleAutoBackup}
        />

        <TouchableOpacity 
          style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} 
          onPress={() => setIsModalVisible(true)}
        >
          <MaterialCommunityIcons name="restore" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Redefinir Dados</Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          animationType="slide"
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
              <MaterialIcons name="warning" size={48} color="#e45635" />
              <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>
                Atenção!
              </Text>
              <Text style={[styles.modalText, isDarkMode ? styles.darkText : styles.lightText]}>
                Esta ação irá apagar todos os dados do aplicativo. Esta ação não pode ser desfeita.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]} 
                  onPress={handleResetData}
                >
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  darkBackground: {
    backgroundColor: '#1F2937',
  },
  lightBackground: {
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#374151',
  },
  lightContainer: {
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  settingGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#374151',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  lightButton: {
    backgroundColor: '#374151',
  },
  darkButton: {
    backgroundColor: '#111827',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  confirmButton: {
    backgroundColor: '#111827',
  },
});

export default SettingsScreen;
