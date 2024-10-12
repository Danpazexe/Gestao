import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Para criar o efeito de rastro

export default function BarcodeScannerScreen({ backButtonSize = 40 }) { 
  const navigation = useNavigation(); 
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [animationValue] = useState(new Animated.Value(0)); // Animação para o movimento da linha
  const [flash, setFlash] = useState(false);
  const [sound, setSound] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [barcodeData, setBarcodeData] = useState('');

  const { width, height } = Dimensions.get('window');
  const scanAreaSize = width * 0.7; 
  const scanAreaX = (width - scanAreaSize) / 2; 
  const scanAreaY = (height - scanAreaSize) / 2; 

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    startAnimation();
    loadSound();
  }, []);

  const startAnimation = () => {
    animationValue.setValue(0);

    Animated.loop(
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 1500, // Velocidade da animação
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  async function loadSound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/Sound/Beep.mp3'));
    setSound(sound);
  }

  const playBeep = async () => {
    if (sound) {
      await sound.replayAsync(); 
    }
  };

  const handleBarCodeScanned = async ({ bounds, data }) => {
    const { origin } = bounds;
    if (
      origin.x >= scanAreaX &&
      origin.x + bounds.size.width <= scanAreaX + scanAreaSize &&
      origin.y >= scanAreaY &&
      origin.y + bounds.size.height <= scanAreaY + scanAreaSize
    ) {
      setScanned(true);
      await playBeep();
      setBarcodeData(data);
      setModalVisible(true); // Mostra o modal com as opções
    }
  };

  const toggleFlash = () => {
    setFlash(!flash);
  };

  const confirmBarcode = () => {
    setModalVisible(false);
    // Passando o código de barras para a AddProductScreen após confirmação
    navigation.navigate('AddProductScreen', { barcodeData });
  };

  const resetScanner = () => {
    setModalVisible(false);
    setScanned(false); // Permite escanear novamente
  };

  if (hasPermission === null) {
    return <Text>Solicitando permissão para usar a câmera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  const scanLineY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scanAreaSize], 
  });

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject} 
        torchMode={flash ? 'on' : 'off'}
      />

      <View style={styles.overlay}>
        <View style={[styles.mask, { height: scanAreaY, width }]} />
        <View style={{ flexDirection: 'row' }}>
          <View style={[styles.mask, { width: scanAreaX, height: scanAreaSize }]} />
          <View style={[styles.scanArea, { width: scanAreaSize, height: scanAreaSize }]}>
            {/* Linha com efeito de rastro gradiente */}
            <Animated.View
              style={[
                { transform: [{ translateY: scanLineY }] },
                styles.scanLineContainer, 
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 59, 48, 0)', '#FF3B30', 'rgba(255, 59, 48, 0)']}
                style={styles.scanLine}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          </View>
          <View style={[styles.mask, { width: scanAreaX, height: scanAreaSize }]} />
        </View>
        <View style={[styles.mask, { height: scanAreaY, width }]} />
      </View>

      {/* Modal para confirmar ou reescanear o código de barras */}
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
                onPress={confirmBarcode}  // Confirmação do código de barras
              >
                <Text style={styles.actionButtonText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.reescanButton]}
                onPress={resetScanner}  // Reescanear
              >
                <Text style={styles.actionButtonText}>Reescanear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AddProductScreen')}>
        <MaterialIcons name="arrow-back" size={backButtonSize} color="#fff" /> 
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={toggleFlash}>
          <MaterialIcons name={flash ? "flash-off" : "flash-on"} size={24} color="white" />
          <Text style={styles.buttonText}>{flash ? 'Desligar Lanterna' : 'Ligar Lanterna'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scanArea: {
    borderColor: '#007AFF',
    borderWidth: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
  },
  scanLineContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'transparent',
  },
  scanLine: {
    width: '105%',
    height: '105%',
    borderRadius: 2,
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
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
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
});
