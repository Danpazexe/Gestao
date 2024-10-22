import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert, TextInput, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductItem from '../Components/ProductItem';
import debounce from 'lodash.debounce';
import LottieView from 'lottie-react-native'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import AlertDialog from '../Components/AlertDialog'; 

// Hook personalizado para gerenciar produtos
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts)); 
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (productsToSave) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(productsToSave));
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
      Alert.alert('Erro', 'Não foi possível salvar os produtos.');
    }
  };

  return { products, setProducts, loadProducts, saveProducts, loading };
};

const ListScreen = ({ route, navigation, isDarkMode }) => {
  const { products, setProducts, loadProducts, saveProducts, loading } = useProducts();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('nome');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (route?.params?.newProduct) {
      const newProduct = {
        ...route.params.newProduct,
        id: Date.now().toString(),
        expirationDate: new Date(route.params.newProduct.expirationDate).toISOString(),
      };

      setProducts((prevProducts) => {
        const productExists = prevProducts.some(
          (p) => p.name === newProduct.name || p.internalCode === newProduct.internalCode
        );

        if (!productExists) {
          const updatedProducts = [...prevProducts, newProduct];
          saveProducts(updatedProducts);
          return updatedProducts;
        } else {
          Alert.alert('Produto já existe', 'Este produto já está na lista.');
        }
        return prevProducts;
      });
    }
  }, [route?.params?.newProduct]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: isDarkMode ? '#2e2e2e' : '#2e97b7',
      },
      headerTintColor: '#FFFFFF',
      headerTitle: 'Lista de Produtos',
    });
  }, [navigation, isDarkMode]);

  const handleDeleteProduct = (product) => {
    setProductToDelete(product); 
    setAlertVisible(true); 
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      const updatedProducts = products.filter(product => product.id !== productToDelete.id); 
      setProducts(updatedProducts);
      await saveProducts(updatedProducts);
      setAlertVisible(false);
      Alert.alert('Sucesso', 'Produto excluído com sucesso!'); 
    }
  };

  const calculateDaysRemaining = (expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const timeDiff = expDate - today;
    return Math.max(Math.floor(timeDiff / (1000 * 3600 * 24)), 0);
  };

  // Filtra e ordena os produtos usando useMemo para otimizar desempenho
  const filterAndSortProducts = useMemo(() => {
    const normalizedSearchText = searchText.toLowerCase();
    return products
      .filter((product) => {
        switch (filterType) {
          case 'nome':
            return product.name?.toLowerCase().includes(normalizedSearchText);
          case 'Codigo Interno':
            return product.internalCode?.toLowerCase().includes(normalizedSearchText);
          case 'ean':
            return product.ean?.toLowerCase().includes(normalizedSearchText);
          default:
            return false;
        }
      })
      .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
  }, [products, searchText, filterType]);

  // Debounce para evitar chamadas excessivas
  const debouncedSearch = debounce((text) => setSearchText(text), 300);

  const renderProductItem = ({ item }) => {
    const daysRemaining = calculateDaysRemaining(item.expirationDate);

    return (
      <View style={[styles.productItem, isDarkMode && styles.darkProductItem]}>
        <ProductItem
          product={{
            ...item,
            expirationDate: new Date(item.expirationDate).toLocaleDateString(),
            daysRemaining,
          }}
          isDarkMode={isDarkMode} // Passando a propriedade para o ProductItem
        />
        <TouchableOpacity onPress={() => handleDeleteProduct(item)} style={styles.deleteButton}>
          <LottieView
            source={require('../../assets/GifAdd/Lixeira.json')} 
            style={styles.lottieIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const toggleFilter = () => {
    setIsFilterVisible((prev) => !prev);
  };

  const setSelectedFilter = (filter) => {
    setFilterType(filter);
    setIsFilterVisible(false);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkBackground]}>
      <View style={styles.searchContainer}>
        <TouchableOpacity style={[styles.filterButton, isDarkMode && styles.darkFilterButton]} onPress={toggleFilter}>
          <Icon name="filter" size={20} color="#FFFFFF" />
          <Text style={styles.filterText}>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</Text>
        </TouchableOpacity>
        {isFilterVisible && (
          <View style={[styles.filterOptions, isDarkMode && styles.darkFilterOptions]}>
            <TouchableOpacity onPress={() => setSelectedFilter('nome')}>
              <Text style={[styles.optionText, styles.lastOptionText]}>Nome</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedFilter('Codigo Interno')}>
              <Text style={styles.optionText}>Código Interno</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedFilter('ean')}>
              <Text style={styles.optionText}>EAN</Text>
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder={`Pesquisar produto por ${filterType}`}
          placeholderTextColor="#888"
          onChangeText={debouncedSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#2e97b7" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filterAndSortProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      
      {/* Dialogo de Confirmação de Exclusão */}
      <AlertDialog 
        visible={alertVisible}
        title="Confirmar Exclusão"
        message="Você tem certeza que deseja excluir este produto?"
        onConfirm={confirmDeleteProduct} 
        onCancel={() => setAlertVisible(false)}
        onDismiss={() => setAlertVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F2F2F2',
  },
  darkBackground: {
    backgroundColor: '#1e1e1e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e97b7',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  darkFilterButton: {
    backgroundColor: '#3b3b3b',
  },
  filterText: {
    color: '#FFFFFF',
    marginLeft: 2,
    fontSize: 16,
  },
  filterOptions: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2b879e',
    borderRadius: 10,
    padding: 10,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  darkFilterOptions: {
    backgroundColor: '#2e2e2e',
  },
  optionText: {
    paddingVertical: 10,
    fontSize: 16,
    color: '#2b879e',
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#2b879e',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  darkSearchInput: {
    backgroundColor: '#3b3b3b',
    borderColor: '#666',
    color: '#FFFFFF',
  },
  productItem: {
    borderRadius: 16,
    marginBottom: 15,
    elevation: 2, 
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative', 
  },
  
  deleteButton: {
    position: 'absolute', 
    top: 8, 
    right: 8, 
    padding: 8, 
  },
  lottieIcon: {
    width: 26,
    height: 26,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default ListScreen;
