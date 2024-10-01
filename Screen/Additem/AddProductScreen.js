import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddProductScreen = ({ navigation }) => {
  const [productName, setProductName] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [ean, setEan] = useState('');
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

    // Configurar o cabeçalho da navegação
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: '#0b8770', // Cor verde desejada
      },
      headerTintColor: '#FFFFFF', // Cor dos elementos no cabeçalho
      headerTitle: 'Cadastro de Produto', // Título do cabeçalho
    });

    loadProducts();
  }, [navigation]);

  const validateInputs = () => {
    if (!productName || !quantity) {
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

      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Erro ao salvar produto');
    }
  };

  const handleScanBarcode = () => {
    Alert.alert('Info', 'Abrindo câmera para leitura do código de barras');
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <TextInput
        label="Nome do Produto"
        value={productName}
        onChangeText={setProductName}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#0b8770', underlineColor: 'transparent' } }}
      />

      <TextInput
        label="Lote"
        value={batch}
        onChangeText={setBatch}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#0b8770', underlineColor: 'transparent' } }}
      />

      <TextInput
        label="Quantidade"
        value={quantity}
        onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#0b8770', underlineColor: 'transparent' } }}
      />

      <TextInput
        label="Código Interno"
        value={internalCode}
        onChangeText={(text) => setInternalCode(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#0b8770', underlineColor: 'transparent' } }}
      />

      <View style={styles.eanContainer}>
        <TextInput
          label="EAN"
          value={ean}
          onChangeText={(text) => setEan(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.eanInput}
          theme={{ colors: { primary: '#0b8770', underlineColor: 'transparent' } }}
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
    backgroundColor: '#eaeaea',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b8770',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  dateText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  selectedDateText: {
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  eanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  eanInput: {
    flex: 1,
    marginRight: 10,
  },
  scanButton: {
    backgroundColor: '#0b8770',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  datePickerButton: {
    backgroundColor: '#0b8770',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0b8770',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 10,
    
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AddProductScreen;
