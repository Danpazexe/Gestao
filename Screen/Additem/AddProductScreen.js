import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarCodeScanner } from 'expo-barcode-scanner';

const AddProductScreen = ({ navigation, route, isDarkMode }) => {
  // Estados para armazenar os valores dos campos de entrada
  const [productName, setProductName] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [ean, setEan] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productId, setProductId] = useState(null);

  // Carregar dados iniciais e configurar o cabeçalho da tela
  useEffect(() => {
    const loadProductData = () => {
      if (route.params?.product) {
        const { id, name, batch, quantity, internalCode, ean, expirationDate } = route.params.product;
        setProductId(id);
        setProductName(name);
        setBatch(batch);
        setQuantity(quantity.toString());
        setInternalCode(internalCode);
        setEan(ean);
        setExpirationDate(new Date(expirationDate));
        setIsEditing(true);
      }
    };

    // Atualiza o código EAN se tiver sido passado pela rota (por ex. de um scanner)
    if (route.params?.barcodeData) {
      setEan(route.params.barcodeData);
    }

    // Configuração da aparência do cabeçalho
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: isDarkMode ? '#3b4f43' : '#5d7e62',
      },
      headerTintColor: '#FFFFFF',
      headerTitle: isEditing ? 'Editar Produto' : 'Cadastro de Produto',
    });

    loadProductData();
  }, [navigation, route.params?.product, route.params?.barcodeData, isDarkMode]);

  // Função para validar os campos de entrada
  const validateInputs = () => {
    if (!productName || !quantity || !batch || !internalCode || !ean || !expirationDate) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return false;
    }
    if (isNaN(parseInt(quantity, 10))) {
      Alert.alert('Erro', 'Quantidade deve ser um número válido');
      return false;
    }
    return true;
  };

  // Função para salvar o produto no armazenamento
  const handleSaveProduct = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expirationDate.setHours(0, 0, 0, 0);

      const timeDiff = expirationDate - today;
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const product = {
        id: productId || Date.now().toString(),
        internalCode,
        name: productName,
        ean,
        batch,
        expirationDate: expirationDate.toISOString(),
        quantity: parseInt(quantity, 10),
        daysRemaining,
      };

      const existingProducts = await AsyncStorage.getItem('products');
      let products = existingProducts ? JSON.parse(existingProducts) : [];

      if (isEditing) {
        products = products.map((p) => (p.id === productId ? product : p));
      } else {
        products.push(product);
      }

      await AsyncStorage.setItem('products', JSON.stringify(products));

      Alert.alert('Sucesso', isEditing ? 'Produto atualizado com sucesso!' : 'Produto salvo com sucesso!');
      navigation.navigate('HomeScreen'); 
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Erro ao salvar produto');
    }
  };

  // Função para solicitar permissão e abrir o leitor de código de barras
  const handleScanBarcode = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === 'granted') {
      navigation.navigate('BarcodeScannerScreen');
    } else {
      Alert.alert('Permissão necessária', 'A permissão para acessar a câmera é necessária para escanear o código de barras.');
    }
  };

  // Função para manipular a data de validade escolhida
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <View style={styles.titleContainer}></View>
      
      {/* Campos de Entrada */}
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Nome do Produto</Text>
      <TextInput placeholder="Ex: Sabão em Pó" value={productName} onChangeText={setProductName} style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Lote</Text>
      <TextInput placeholder="Ex: 123456" value={batch} onChangeText={setBatch} style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Quantidade</Text>
      <TextInput placeholder="Ex: 10" value={quantity} onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Código Interno</Text>
      <TextInput placeholder="Ex: 001" value={internalCode} onChangeText={(text) => setInternalCode(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>EAN</Text>
      <View style={styles.eanContainer}>
        <TextInput placeholder="Ex: 7891234567890" value={ean} onChangeText={(text) => setEan(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={[styles.eanInput, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
        <TouchableOpacity style={styles.scanButton} onPress={handleScanBarcode}>
          <Text style={styles.buttonText}>Escanear</Text>
        </TouchableOpacity>
      </View>

      {/* Selecionar Data de Validade */}
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Data de Validade</Text>
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Selecionar Data</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={expirationDate} mode="date" display="spinner" onChange={onChangeDate} minimumDate={new Date()} locale="pt-BR" />
      )}
      <Text style={[styles.selectedDateText, isDarkMode ? styles.darkText : styles.lightText]}>
        {expirationDate ? `Data Selecionada: ${expirationDate.toLocaleDateString('pt-BR')}` : 'Nenhuma data selecionada'}
      </Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
        <Text style={styles.buttonText}>{isEditing ? 'Atualizar Produto' : 'Salvar Produto'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  lightBackground: {
    backgroundColor: '#F9F9F9', 
  },
  darkBackground: {
    backgroundColor: '#181818', 
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#5d7e62', 
  },
  lightInput: {
    backgroundColor: '#FFFFFF',
  },
  darkInput: {
    backgroundColor: '#2E3D34', 
  },
  lightText: {
    color: '#000000',
  },
  darkText: {
    color: '#E0E0E0', 
  },
  label: {
    marginBottom: 3,
    fontWeight: 'bold',
    fontSize: 13,
  },
  eanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  eanInput: {
    flex: 1,
    height: 50,
    marginRight: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#5d7e62', 
  },
  scanButton: {
    backgroundColor: '#5d7e62',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateText: {
    fontSize: 18,
    color: '#555555',
    textAlign: 'center',
    marginVertical: 10,
  },
  selectedDateText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginVertical: 10,
  },
  datePickerButton: {
    backgroundColor: '#5d7e62',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 50,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#5d7e62',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 50,
    marginTop: 20,
  },
});

export default AddProductScreen;
