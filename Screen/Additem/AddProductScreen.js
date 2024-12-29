import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Dados from '../../assets/Dados.json'; // ou importação de onde os dados estão salvos

const AddProductScreen = ({ navigation, route, isDarkMode }) => {
  const [productName, setProductName] = useState('');
  const [lote, setBatch] = useState('');
  const [quantidade, setQuantity] = useState('');
  const [codprod, setcodprod] = useState('');
  const [codauxiliar, setEan] = useState('');
  const [validade, setExpirationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productId, setProductId] = useState(null);

  useEffect(() => {
    // Função que carrega os dados do produto para edição
    const loadProductData = () => {
      if (route.params?.product) {
        const { id, descricao, lote, quantidade, codprod, codauxiliar, validade } = route.params.product;
        setProductId(id);
        setProductName(descricao);
        setBatch(lote);
        setQuantity(quantidade.toString());
        setcodprod(codprod);
        setEan(codauxiliar);
        setExpirationDate(new Date(validade));
        setIsEditing(true);
        console.log("Dados carregados para edição:", route.params.product);  // Log para verificar os dados recebidos
      }
    };

    // Atualiza o código EAN se for passado pela rota
    if (route.params?.barcodeData) {
      setEan(route.params.barcodeData);
      handleBarcodeScan(route.params.barcodeData); // Chama a função de busca ao escanear
      console.log("Código EAN recebido da rota:", route.params.barcodeData);  // Log para verificar o EAN recebido
    }

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

  // Função para validar os campos
  const validateInputs = () => {
    if (!productName || !quantidade || !lote || !codprod || !codauxiliar || !validade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      console.log("Validação falhou: Campos obrigatórios não preenchidos");  
      return false;
    }
    if (isNaN(parseInt(quantidade, 10))) {
      Alert.alert('Erro', 'Quantidade deve ser um número válido');
      console.log("Validação falhou: Quantidade não é um número válido");  
      return false;
    }
    console.log("Validação bem-sucedida");  // Log para confirmar que a validação passou
    return true;
  };

  // Função para buscar no Dados.json
  const handleBarcodeScan = (scannedEan) => {
    const formattedScannedEan = String(scannedEan).trim(); // Garantir que o EAN seja uma string
    console.log("EAN escaneado:", formattedScannedEan);  // Log para verificar o EAN escaneado
  
    // Encontrar o produto no JSON com base no EAN
    const product = Dados.find(p => String(p.CODAUXILIAR).trim() === formattedScannedEan);
  
    if (product) {
      // Log para verificar os dados do produto
      console.log("Produto encontrado:", product);
  
      // Verifique os valores antes de atualizá-los
      console.log("CODPROD:", product.CODPROD);
      console.log("CODAUXILIAR:", product.CODAUXILIAR);
      console.log("DESCRICAO:", product.DESCRICAO);
      
      // Preenchendo os campos corretamente
      setProductName(product.DESCRICAO);  // Nome do produto
      setcodprod(String(product.CODPROD)); // Garantir que CODPROD seja uma string
      setEan(String(product.CODAUXILIAR)); // Garantir que CODAUXILIAR seja uma string
    } else {
      console.log(`Produto não encontrado no JSON para EAN: ${formattedScannedEan}`);
      Alert.alert('Produto não encontrado', 'Não foi possível encontrar o produto com o EAN fornecido.');
    }
  };
  
  const handleSaveProduct = async () => {
    if (!validateInputs()) {
      console.log("Produto não salvo devido a erro de validação");
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      validade.setHours(0, 0, 0, 0);

      const timeDiff = validade - today;
      const diasrestantes = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const product = {
        id: productId || Date.now().toString(),
        codprod,
        descricao: productName,
        codauxiliar,
        lote,
        validade: validade.toISOString(),
        quantidade: parseInt(quantidade, 10),
        diasrestantes,
      };

      console.log("Produto a ser salvo:", product);  // Log para verificar os dados do produto a ser salvo

      const existingProducts = await AsyncStorage.getItem('products');
      let products = existingProducts ? JSON.parse(existingProducts) : [];
      console.log("Produtos existentes:", products);  // Log para verificar os produtos existentes

      if (isEditing) {
        products = products.map((p) => (p.id === productId ? product : p));
        console.log("Produto atualizado:", product);  // Log para verificar se o produto foi atualizado
      } else {
        products.push(product);
        console.log("Novo produto adicionado:", product);  // Log para verificar se o produto foi adicionado
      }

      await AsyncStorage.setItem('products', JSON.stringify(products));

      Alert.alert('Sucesso', isEditing ? 'Produto atualizado com sucesso!' : 'Produto salvo com sucesso!');
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error("Erro ao salvar produto:", error);  // Log de erro ao salvar produto
      Alert.alert('Erro', 'Erro ao salvar produto');
    }
  };

  const handleScanBarcode = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    console.log("Status da permissão para a câmera:", status);  // Log do status da permissão
    if (status === 'granted') {
      navigation.navigate('BarcodeScannerScreen');
    } else {
      Alert.alert('Permissão necessária', 'A permissão para acessar a câmera é necessária para escanear o código de barras.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(selectedDate);
      console.log("Data de validade selecionada:", selectedDate);  // Log para verificar a data de validade
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <View style={styles.titleContainer}></View>
      
      {/* Campos de Entrada */}
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Nome do Produto</Text>
      <TextInput placeholder="Ex: Sabão em Pó" value={productName} onChangeText={setProductName} style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Lote</Text>
      <TextInput placeholder="Ex: 123456" value={lote} onChangeText={setBatch} style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Quantidade</Text>
      <TextInput placeholder="Ex: 10" value={quantidade} onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>Código Interno</Text>
      <TextInput placeholder="Ex: 001" value={codprod} onChangeText={(text) => setcodprod(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
      
      <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>EAN</Text>
      <View style={styles.eanContainer}>
        <TextInput placeholder="Ex: 7891234567890" value={codauxiliar} onChangeText={(text) => setEan(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={[styles.eanInput, isDarkMode ? styles.darkInput : styles.lightInput]} placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'} />
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
        <DateTimePicker value={validade} mode="date" display="spinner" onChange={onChangeDate} minimumDate={new Date()} locale="pt-BR" />
      )}
      <Text style={[styles.selectedDateText, isDarkMode ? styles.darkText : styles.lightText]}>
        {validade ? `Data Selecionada: ${validade.toLocaleDateString('pt-BR')}` : 'Nenhuma data selecionada'}
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
    fontWeight: 'bold',
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