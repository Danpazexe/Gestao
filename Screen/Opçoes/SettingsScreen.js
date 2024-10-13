import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Modal, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const SettingsScreen = ({ isDarkMode, setIsDarkMode }) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode); // Altera o estado global do tema
  };

  const toggleNotifications = async () => {
    const previousState = isNotificationsEnabled;
    setIsNotificationsEnabled(!previousState);

    if (!previousState) {
      // Habilitar notificações
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão para notificações foi negada');
      }
    } else {
      // Desativar notificações
      alert('Notificações desativadas');
    }
  };

  const handleResetData = async () => {
    try {
      await AsyncStorage.clear();
      setIsModalVisible(false);
      Alert.alert('Sucesso', 'Dados redefinidos com sucesso!');
    } catch (e) {
      console.error('Erro ao redefinir dados', e);
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Configurações</Text>

      <View style={styles.settingItem}>
        <Text style={[styles.settingText, isDarkMode ? styles.darkText : styles.lightText]}>Modo Escuro</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={[styles.settingText, isDarkMode ? styles.darkText : styles.lightText]}>Notificações</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Redefinir Dados</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Redefinição</Text>
            <Text style={styles.modalText}>Você tem certeza que deseja redefinir todos os dados?</Text>

            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setIsModalVisible(false)} />
              <Button title="Confirmar" onPress={handleResetData} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  lightBackground: {
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default SettingsScreen;
