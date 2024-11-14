import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { BarCodeScanner } from 'expo-barcode-scanner';

const BarcodeScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null); // Permissão de câmera
  const [scanned, setScanned] = useState(false); // Controle de escaneamento
  const [modalVisible, setModalVisible] = useState(false); // Visibilidade do modal
  const [sound, setSound] = useState(); // Som do beep
  const [barcodeData, setBarcodeData] = useState(''); // Dados do código de barras

  // Solicita permissão de câmera e carrega o som
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') await loadSound();
    };
    requestPermissions();
  }, []);

  // Manipula o escaneamento do código de barras
  const handleBarCodeScanned = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      await playBeep();
      setBarcodeData(data);
      setModalVisible(true);
    }
  };

  // Confirma o código e navega para a tela de adicionar produto
  const confirmBarcode = () => {
    setModalVisible(false);
    navigation.navigate('AddProductScreen', { barcodeData });
  };

  // Reseta o scanner para uma nova leitura
  const resetScanner = () => {
    setModalVisible(false);
    setScanned(false);
  };

  // Carrega o som do beep
  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/Sound/Beep.mp3'));
    setSound(sound);
  };

  // Reproduz o som do beep
  const playBeep = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  // Verifica permissão da câmera e exibe mensagens
  if (hasPermission === null) {
    return <Text style={styles.permissionText}>Solicitando permissão para usar a câmera...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.permissionText}>Permissão para acessar a câmera foi negada.</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetScanner}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Código de Barras Lido</Text>
            <Text style={styles.modalData}>{barcodeData}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.okButton]}
                onPress={confirmBarcode}
              >
                <Text style={styles.actionButtonText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.reescanButton]}
                onPress={resetScanner}
              >
                <Text style={styles.actionButtonText}>Reescanear</Text>
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
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4A90E2',
  },
  modalData: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    flex: 1,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  okButton: {
    backgroundColor: '#4CAF50',
  },
  reescanButton: {
    backgroundColor: '#FFC107',
  },
  actionButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default BarcodeScannerScreen;
