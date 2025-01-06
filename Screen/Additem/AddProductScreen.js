import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Dados from '../../assets/Dados.json'; // ou importação de onde os dados estão salvos
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

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
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

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
      
      Toast.show({
        type: 'success',
        text1: 'Produto Encontrado',
        text2: 'Dados preenchidos automaticamente',
        visibilityTime: 2000,
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Produto não encontrado',
        text2: 'Não foi possível encontrar o produto com o EAN fornecido.',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };
  
  const handleSaveProduct = async () => {
    setShowErrors(true);

    const hasEmptyFields = ['productName', 'lote', 'quantidade', 'codprod', 'codauxiliar', 'validade'].some(field => 
      checkEmptyFields(field)
    );

    if (hasEmptyFields) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Por favor, preencha todos os campos obrigatórios.',
        visibilityTime: 3000,
        position: 'top',
      });
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

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: isEditing ? 'Produto atualizado com sucesso!' : 'Produto salvo com sucesso!',
        visibilityTime: 2000,
        position: 'top',
      });
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao salvar produto',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const handleScanBarcode = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    console.log("Status da permissão para a câmera:", status);
    
    if (status === 'granted') {
      Toast.show({
        type: 'info',
        text1: 'Scanner Ativo',
        text2: 'Posicione o código de barras no centro da tela',
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.navigate('BarcodeScannerScreen');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Permissão necessária',
        text2: 'A permissão para acessar a câmera é necessária para escanear o código de barras.',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(selectedDate);
      console.log("Data de validade selecionada:", selectedDate);  // Log para verificar a data de validade
    }
  };

  // Função para verificar campos vazios
  const checkEmptyFields = (field) => {
    switch (field) {
      case 'productName':
        return !productName.trim();
      case 'lote':
        return !lote.trim();
      case 'quantidade':
        return !quantidade.trim();
      case 'codprod':
        return !codprod.trim();
      case 'codauxiliar':
        return !codauxiliar.trim();
      default:
        return false;
    }
  };

  // Função para renderizar o ícone de status do campo
  const renderFieldStatus = (field) => {
    if (!showErrors) return null;

    if (checkEmptyFields(field)) {
      return (
        <MaterialIcons 
          name="error-outline" 
          size={24} 
          color={isDarkMode ? '#FF6B6B' : '#B00020'}
          style={styles.fieldIcon}
        />
      );
    }
    return (
      <MaterialIcons 
        name="check-circle" 
        size={24} 
        color={isDarkMode ? '#4ADE80' : '#4CAF50'}
        style={styles.fieldIcon}
      />
    );
  };

  // Mova a definição dos styles para dentro do componente
  const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 20, // Espaço extra no final da rolagem
    },
    headerGradient: {
      padding: 16,
      alignItems: 'center',
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: 'bold',
    },
    formCard: {
      margin: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    fieldContainer: {
      marginBottom: 16, // Aumentado o espaçamento entre campos
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 6,
      color: isDarkMode ? '#FFFFFF' : '#333333',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 8,
      borderColor: isDarkMode ? '#404040' : '#E0E0E0',
      backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      padding: 4,
    },
    input: {
      flex: 1,
      height: 45,
      paddingHorizontal: 14,
      fontSize: 15,
      color: isDarkMode ? '#FFFFFF' : '#000000',
    },
    lightInput: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
    },
    darkInput: {
      backgroundColor: '#333333',
      color: '#E0E0E0',
      borderColor: '#404040',
    },
    eanContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    eanInput: {
      flex: 1,
      height: 48,
      marginRight: 8,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#404040' : '#E0E0E0',
    },
    scanButton: {
      width: 45,
      height: 45,
      backgroundColor: isDarkMode ? '#4A6B50' : '#5d7e62',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateButton: {
      height: 45,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      borderRadius: 8,
    },
    dateText: {
      marginLeft: 8,
      fontSize: 16,
    },
    saveButton: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#4A6B50' : '#5d7e62',
      height: 50,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    lightBackground: {
      backgroundColor: '#F5F5F5',
    },
    darkBackground: {
      backgroundColor: '#121212',
    },
    lightText: {
      color: '#333333',
    },
    darkText: {
      color: '#E0E0E0',
    },
    fieldIcon: {
      marginRight: 12,
      marginLeft: 4,
    },
    requiredText: {
      fontSize: 12,
      marginTop: 4,
      color: isDarkMode ? '#FF6B6B' : '#B00020',
    },
    emptyField: {
      borderColor: isDarkMode ? '#FF6B6B' : '#B00020',
      borderWidth: 2,
      backgroundColor: isDarkMode ? '#2D1F1F' : '#FFF5F5',
    },
    requiredAsterisk: {
      color: isDarkMode ? '#FF6B6B' : '#B00020',
      marginLeft: 4,
    },
  });

  // Use os estilos dentro do componente
  const styles = getStyles(isDarkMode);

  return (
    <View style={[
      styles.container, 
      isDarkMode ? styles.darkBackground : styles.lightBackground
    ]}>
      <LinearGradient
        colors={isDarkMode ? ['#1E272E', '#2C3A47'] : ['#5d7e62', '#3b4f43']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.formCard}>
          {/* Campo Nome do Produto */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
              Nome do Produto
            </Text>
            <View style={[
              styles.inputContainer,
              showErrors && checkEmptyFields('productName') && styles.emptyField
            ]}>
              <TextInput
                placeholder="Ex: Sabão em Pó"
                value={productName}
                onChangeText={setProductName}
                style={styles.input}
                placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'}
              />
              {renderFieldStatus('productName')}
            </View>
            {showErrors && checkEmptyFields('productName') && (
              <Text style={styles.requiredText}>Campo obrigatório</Text>
            )}
          </View>

          {/* Campos Lote e Quantidade em linha */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
                Lote
              </Text>
              <View style={[
                styles.inputContainer,
                showErrors && checkEmptyFields('lote') && styles.emptyField
              ]}>
                <TextInput
                  placeholder="Ex: 123456"
                  value={lote}
                  onChangeText={setBatch}
                  style={styles.input}
                  placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'}
                />
                {renderFieldStatus('lote')}
              </View>
              {showErrors && checkEmptyFields('lote') && (
                <Text style={styles.requiredText}>Campo obrigatório</Text>
              )}
            </View>

            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
                Quantidade
              </Text>
              <View style={[
                styles.inputContainer,
                showErrors && checkEmptyFields('quantidade') && styles.emptyField
              ]}>
                <TextInput
                  placeholder="Ex: 10"
                  value={quantidade}
                  onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'}
                />
                {renderFieldStatus('quantidade')}
              </View>
              {showErrors && checkEmptyFields('quantidade') && (
                <Text style={styles.requiredText}>Campo obrigatório</Text>
              )}
            </View>
          </View>

          {/* Campo Código Interno */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
              Código Interno
            </Text>
            <View style={[
              styles.inputContainer,
              showErrors && checkEmptyFields('codprod') && styles.emptyField
            ]}>
              <TextInput
                placeholder="Ex: 001"
                value={codprod}
                onChangeText={(text) => setcodprod(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'}
              />
              {renderFieldStatus('codprod')}
            </View>
            {showErrors && checkEmptyFields('codprod') && (
              <Text style={styles.requiredText}>Campo obrigatório</Text>
            )}
          </View>

          {/* Campo EAN */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
              EAN
            </Text>
            <View style={styles.eanContainer}>
              <View style={[
                styles.inputContainer,
                { flex: 1, marginRight: 8 },
                showErrors && checkEmptyFields('codauxiliar') && styles.emptyField
              ]}>
                <TextInput
                  placeholder="Ex: 7891234567890"
                  value={codauxiliar}
                  onChangeText={(text) => setEan(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={isDarkMode ? '#A8B8A7' : '#A9A9A9'}
                />
                {renderFieldStatus('codauxiliar')}
              </View>
              <TouchableOpacity 
                style={styles.scanButton} 
                onPress={handleScanBarcode}
              >
                <MaterialCommunityIcons name="barcode-scan" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {showErrors && checkEmptyFields('codauxiliar') && (
              <Text style={styles.requiredText}>Campo obrigatório</Text>
            )}
          </View>

          {/* Campo Data de Validade */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, isDarkMode ? styles.darkText : styles.lightText]}>
              Data de Validade
            </Text>
            <View style={[
              styles.inputContainer,
              showErrors && checkEmptyFields('validade') && styles.emptyField
            ]}>
              <TouchableOpacity 
                style={[styles.dateButton, { flex: 1, borderWidth: 0 }]} 
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={24} 
                  color={isDarkMode ? '#A8B8A7' : '#5d7e62'} 
                />
                <Text style={[styles.dateText, isDarkMode ? styles.darkText : styles.lightText]}>
                  {validade.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
              {renderFieldStatus('validade')}
            </View>
            {showErrors && checkEmptyFields('validade') && (
              <Text style={styles.requiredText}>Campo obrigatório</Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={validade}
              mode="date"
              display="spinner"
              onChange={onChangeDate}
              minimumDate={new Date()}
              locale="pt-BR"
            />
          )}

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveProduct}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="content-save" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Atualizar' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddProductScreen;