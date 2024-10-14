import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ isDarkMode, setIsDarkMode, navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
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

  // Configurando o título da tela para "Configurações"
  navigation.setOptions({
    headerShown: true,
    headerStyle: {
      backgroundColor: isDarkMode ? '#181818' : '#6cb6a5', // Usando a tonalidade para o fundo
    },
    headerTintColor: '#FFFFFF',
    headerTitle: 'Configurações',  // Título atualizado
  });

  const handleImportExportData = () => {
    Alert.alert('Importar/Exportar', 'Função de importação/exportação de dados em desenvolvimento.');
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>

      <View style={[styles.settingGroup, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
        {/* Configuração de Tema */}
        <Text style={[styles.settingText, isDarkMode ? styles.darkText : styles.lightText]}>Modo Escuro</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: "#e45635", true: "#4CAF50" }}
          thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          style={styles.switch}
        />
      </View>

      <View style={[styles.settingGroup, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
        {/* Notificações de Validade */}
        <Text style={[styles.settingText, isDarkMode ? styles.darkText : styles.lightText]}>Notificações de Validade</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: "#e45635", true: "#4CAF50" }}
          thumbColor={isNotificationsEnabled ? "#ffffff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          style={styles.switch}
        />
      </View>

      {/* Botão de Importar/Exportar Dados */}
      <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleImportExportData}>
        <Text style={styles.buttonText}>Importar/Exportar Dados</Text>
      </TouchableOpacity>

      {/* Botão de Redefinir Dados */}
      <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Redefinir Dados</Text>
      </TouchableOpacity>

      {/* Modal de Confirmação */}
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
              <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleResetData}>
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  darkBackground: {
    backgroundColor: '#181818',
  },
  lightBackground: {
    backgroundColor: '#F9F9F9',
  },
  darkContainer: {
    backgroundColor: '#252525',  // Cor mais clara para contraste no modo escuro
  },
  lightContainer: {
    backgroundColor: '#FFF',
  },
  settingGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    padding: 10,
    borderRadius: 10,
    elevation: 2,  // Sombra no Android
    shadowColor: '#000',  // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  settingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  darkText: {
    color: '#EAEAEA',
  },
  lightText: {
    color: '#333333',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  button: {
    marginVertical: 15,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  lightButton: {
    backgroundColor: '#181818',
  },
  darkButton: {
    backgroundColor: '#6cb6a5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 320,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
