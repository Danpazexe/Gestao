import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Paleta de cores
const colors = {
  primary: '#294380',
  success: '#012677',
  import: '#012677',
  backgroundLight: '#f8f8f8',
  backgroundDark: '#181818',
  white: '#FFFFFF',
  black: '#333333',
  textLight: '#333333',
  textDark: '#FFFFFF',
};

const ExcelScreen = ({ navigation, isDarkMode }) => {
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: isDarkMode ? '#012677' : colors.primary,
      },
      headerTintColor: colors.white,
      headerTitle: 'Exportação / Importação',
    });

    loadProducts();
  }, [navigation, isDarkMode]);

  const loadProducts = useCallback(async () => {
    try {
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        setProductsCount(parsedProducts.length);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToExcel = async () => {
    if (productsCount === 0) {
      return Alert.alert('Exportação', 'Não há produtos para exportar.');
    }

    setIsProcessing(true);
    try {
      const workBook = XLSX.utils.book_new();
      const workSheet = XLSX.utils.json_to_sheet(await AsyncStorage.getItem('products') ? JSON.parse(await AsyncStorage.getItem('products')) : []);
      XLSX.utils.book_append_sheet(workBook, workSheet, 'Produtos');

      const excelBuffer = XLSX.write(workBook, { bookType: 'xlsx', type: 'base64' });
      const fileUri = `${FileSystem.documentDirectory}produtos.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, { encoding: FileSystem.EncodingType.Base64 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não suportado neste dispositivo.');
      }
    } catch (error) {
      Alert.alert('Erro ao exportar para Excel', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const importFromExcel = async () => {
    setIsProcessing(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });

      if (result.canceled) {
        return Alert.alert('Importação', 'Importação cancelada');
      }

      const { uri } = result.assets[0];

      if (!uri.endsWith('.xlsx')) {
        return Alert.alert('Erro', 'Por favor, selecione um arquivo .xlsx.');
      }

      const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const workBook = XLSX.read(fileContent, { type: 'base64' });
      const workSheet = workBook.Sheets[workBook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(workSheet);

      await AsyncStorage.setItem('products', JSON.stringify(data));
      setProductsCount(data.length);
      Alert.alert('Importação', `${data.length} itens importados e salvos com sucesso!`);
    } catch (error) {
      Alert.alert('Erro ao importar Excel', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.backgroundDark : colors.backgroundLight }]}>
      {isProcessing ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <>
          <Text style={[styles.title, { color: isDarkMode ? colors.textDark : colors.textLight }]}>Gerenciamento de Produtos</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.success }]} onPress={exportToExcel} disabled={loading}>
              <Text style={styles.buttonText}>Exportar para Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.import }]} onPress={importFromExcel}>
              <Text style={styles.buttonText}>Importar do Excel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// Estilos para a tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 6,
    width: '100%',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
});

export default ExcelScreen;
