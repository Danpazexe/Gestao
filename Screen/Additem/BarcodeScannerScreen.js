import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BarcodeScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [sound, setSound] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [barcodeData, setBarcodeData] = useState('');
  const [flash, setFlash] = useState(false);
  const [animationValue] = useState(new Animated.Value(0)); // Animação para a linha de escaneamento

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    loadSound();
    startAnimation(); // Iniciar a animação assim que o componente monta
  }, []);

  async function loadSound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/Sound/Beep.mp3'));
    setSound(sound);
  }

  const playBeep = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      await playBeep();
      setBarcodeData(data);
      setModalVisible(true);
    }
  };

  const confirmBarcode = () => {
    setModalVisible(false);
    navigation.navigate('AddProductScreen', { barcodeData });
  };

  const resetScanner = () => {
    setModalVisible(false);
    setScanned(false);
  };

  const toggleFlash = () => {
    setFlash((prevFlash) => !prevFlash);
  };

  const startAnimation = () => {
    animationValue.setValue(0);
    Animated.loop(
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  
  const scanLineY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [180, 600], // Altura da linha de escaneamento
  });

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        torchMode={flash ? 'on' : 'off'}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.scanLineContainer, { transform: [{ translateY: scanLineY }] }]}
          >
            <LinearGradient
              colors={['rgba(255, 59, 48, 0)', '#FF3B30', '#FF3B30', 'rgba(255, 59, 48, 0)']} // Gradiente ajustado
              style={styles.scanLine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          <Text style={styles.instructions}>Aponte a câmera para o código de barras</Text>
        </View>
      </BarCodeScanner>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AddProductScreen')}>
        <MaterialIcons name="arrow-back" size={36} color="#fff" />
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleFlash}>
          <MaterialIcons name={flash ? "flash-off" : "flash-on"} size={24} color="white" />
          <Text style={styles.buttonText}>{flash ? 'Desligar Lanterna' : 'Ligar Lanterna'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  instructions: {
    fontSize: 18,
    color: '#fff',
  },
  scanLineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'transparent',
  },
  scanLine: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modalData: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  okButton: {
    backgroundColor: '#34C759',
  },
  reescanButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BarcodeScannerScreen;
