import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarCodeScanner } from 'expo-barcode-scanner';

const AddProductScreen = ({ navigation, route }) => { // Adicione 'route' para capturar parâmetros
  const [productName, setProductName] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [ean, setEan] = useState(''); // Estado para o EAN
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const existingProducts = await AsyncStorage.getItem('products');
        if (existingProducts) {
          JSON.parse(existingProducts);
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao carregar produtos');
      }
    };

    // Captura o código de barras passado pela BarcodeScannerScreen
    if (route.params?.barcodeData) {  // Verifica se o parâmetro barcodeData existe
      setEan(route.params.barcodeData);  // Atualiza o campo EAN com o valor lido
    }

    // Configurar o cabeçalho da navegação
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: '#4c7840',
      },
      headerTintColor: '#FFFFFF',
      headerTitle: 'Cadastro de Produtos',
    });

    loadProducts();
  }, [navigation, route.params?.barcodeData]); // Adicione 'route.params?.barcodeData' como dependência

  const validateInputs = () => {
    if (!productName || !quantity ||  !batch ||  !internalCode ||  !ean ||  !expirationDate ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (isNaN(parseInt(quantity, 10))) {
      Alert.alert('Erro', 'Quantidade deve ser um número válido');
      return false;
    }

    return true;
  };

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
        id: Date.now().toString(), // Gerar um ID único para o produto
        internalCode,
        name: productName,
        ean,
        batch,
        expirationDate: expirationDate.toISOString(),
        quantity: parseInt(quantity, 10),
        daysRemaining,
      };
  
      const existingProducts = await AsyncStorage.getItem('products');
      const products = existingProducts ? JSON.parse(existingProducts) : [];
      products.push(product);
      await AsyncStorage.setItem('products', JSON.stringify(products));
  
      Alert.alert('Sucesso', 'Produto salvo com sucesso!');
      navigation.navigate('HomeScreen'); // Navega para a tela inicial
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Erro ao salvar produto');
    }
  };

  const handleScanBarcode = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === 'granted') {
      navigation.navigate('BarcodeScannerScreen'); // Redireciona para uma tela de scanner
    } else {
      Alert.alert('Permissão necessária', 'A permissão para acessar a câmera é necessária para escanear o código de barras.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.titleContainer}>
        <Image
          source={require('../../assets/LogoApp.png')} // Substitua pelo caminho do seu ícone ou logotipo
          style={styles.logo}
        />
      </View>

      <TextInput
        label="Nome do Produto"
        placeholder="Ex: Sabão em Pó"
        value={productName}
        onChangeText={setProductName}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#4c7840', underlineColor: 'transparent' } }}
      />

      <TextInput
        label="Lote"
        placeholder="Ex: 123456"
        value={batch}
        onChangeText={setBatch}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#4c7840', underlineColor: 'transparent' } }}
      />

      <TextInput
        label="Quantidade"
        placeholder="Ex: 10"
        value={quantity}
        onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#4c7840', underlineColor: 'transparent' } }}
      />

      <TextInput
        label="Código Interno"
        placeholder="Ex: 001"
        value={internalCode}
        onChangeText={(text) => setInternalCode(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#4c7840', underlineColor: 'transparent' } }}
      />

      <View style={styles.eanContainer}>
        <TextInput
          label="EAN"
          placeholder="Ex: 7891234567890"
          value={ean}
          onChangeText={(text) => setEan(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.eanInput}
          theme={{ colors: { primary: '#4c7840', underlineColor: 'transparent' } }}
        />
        <TouchableOpacity style={styles.scanButton} onPress={handleScanBarcode}>
          <Text style={styles.buttonText}>Escanear</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>Data de Validade</Text>
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Selecionar Data</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={expirationDate}
          mode="date"
          display="spinner"
          onChange={onChangeDate}
          minimumDate={new Date()}
          locale="pt-BR"
        />
      )}

      <Text style={styles.selectedDateText}>
        {expirationDate ? `Data Selecionada: ${expirationDate.toLocaleDateString('pt-BR')}` : 'Nenhuma data selecionada'}
      </Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
        <Text style={styles.buttonText}>Salvar Produto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 100, // Ajuste o tamanho conforme necessário
    height: 100, // Ajuste o tamanho conforme necessário
  },
  input: {
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  selectedDateText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  eanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eanInput: {
    flex: 1,
    height: 50,
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  scanButton: {
    backgroundColor: '#4c7840',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  datePickerButton: {
    backgroundColor: '#4c7840',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4c7840',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default AddProductScreen;
