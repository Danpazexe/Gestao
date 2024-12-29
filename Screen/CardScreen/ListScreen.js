import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert, TextInput, ActivityIndicator, Image, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductItem from '../Components/ProductItem';
import debounce from 'lodash.debounce';
import AlertDialog from '../Components/AlertDialog';
import { Swipeable } from 'react-native-gesture-handler';
import { Animated } from 'react-native';

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
  const [filterType, setFilterType] = useState('descricao');
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
        validade: new Date(route.params.newProduct.validade).toISOString(),
      };

      setProducts((prevProducts) => {
        const productExists = prevProducts.some(
          (p) => p.name === newProduct.name || p.codprod === newProduct.codprod
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
        backgroundColor: isDarkMode ? '#2e2e2e' : '#0077ed',
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

  const handleEditProduct = (product) => {
    navigation.navigate('AddProductScreen', { product });
  };

  const calculatediasrestantes = (validade) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(validade);
    expDate.setHours(0, 0, 0, 0);
    const timeDiff = expDate - today;
    return Math.max(Math.floor(timeDiff / (1000 * 3600 * 24)), 0);
  };

  const filterAndSortProducts = useMemo(() => {
    const normalizedSearchText = searchText.toLowerCase();
    return products
      .filter((product) => {
        switch (filterType) {
          case 'descricao':
            return product.descricao?.toLowerCase().includes(normalizedSearchText);
          case 'codprod':
            return product.codprod?.toLowerCase().includes(normalizedSearchText);
          case 'codauxiliar':
            return product.codauxiliar?.toLowerCase().includes(normalizedSearchText);
          default:
            return false;
        }
      })
      .sort((a, b) => new Date(a.validade) - new Date(b.validade));
  }, [products, searchText, filterType]);

  const debouncedSearch = debounce((text) => setSearchText(text), 300);

  const renderProductItem = ({ item }) => {
    const diasrestantes = calculatediasrestantes(item.validade);
  
    const animatedStyle = new Animated.Value(1);
  
    const onSwipeStart = () => {
      Animated.timing(animatedStyle, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };
  
    const onSwipeEnd = () => {
      Animated.timing(animatedStyle, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };
  
    return (
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}  
        onSwipeableOpen={onSwipeStart}
        onSwipeableClose={onSwipeEnd}
        style={styles.swipeable}
      >
        <Animated.View
          style={[
            styles.productItem,
            isDarkMode && styles.darkProductItem,
            { transform: [{ scale: animatedStyle }] },
          ]}
        >
          <ProductItem
            product={{
              ...item,
              validade: new Date(item.validade).toLocaleDateString('pt-BR'),
              diasrestantes,
            }}
            isDarkMode={isDarkMode}
          />
        </Animated.View>
      </Swipeable>
    );
  };
  
  const renderRightActions = (progress, dragX, item) => {  // Adicionando o parâmetro item
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.7], // Reduz o tamanho até 70%
      extrapolate: 'clamp',
    });
  
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1], // Aumenta a opacidade gradualmente
      extrapolate: 'clamp',
    });
  
    return (
      <Animated.View
        style={[
          styles.actionsContainer,
          { transform: [{ scale }], opacity },
        ]}
      >
        <TouchableOpacity onPress={() => handleEditProduct(item)} style={styles.editAction}>
          <Image
            source={require('../../assets/Listpng/Editar.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteProduct(item)} style={styles.deleteAction}>
          <Image
            source={require('../../assets/Listpng/Excluir.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
      </Animated.View>
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
          <Text style={styles.filterText}>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</Text>
        </TouchableOpacity>
        {isFilterVisible && (
          <View style={[styles.filterOptions, isDarkMode && styles.darkFilterOptions]}>
            <TouchableOpacity onPress={() => setSelectedFilter('descricao')}>
              <Text style={[styles.optionText, styles.lastOptionText]}>Nome</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedFilter('codprod')}>
              <Text style={styles.optionText}>Código Interno</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedFilter('codauxiliar')}>
              <Text style={styles.optionText}>Código de barras</Text>
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
        <ActivityIndicator size="large" color="#0077ed" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filterAndSortProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
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
    backgroundColor: '#0077ed',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    zIndex: 1,
  },
  darkFilterButton: {
    backgroundColor: '#3b3b3b',
  },
  filterText: {
    color: '#FFFFFF',
    marginLeft: 2,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  darkSearchInput: {
    backgroundColor: '#444',
    color: '#fff',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    position: 'relative',
  },
  darkProductItem: {
    backgroundColor: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingBottom: 8,
    marginRight: 0,
  },
  editAction: {
    backgroundColor: '#a1b3b2',
    paddingVertical: 70, // Aumenta a altura do botão
    paddingHorizontal: 25, // Mantém o padding horizontal
    borderRadius: 10,
    marginRight: 8,
  },
  
  deleteAction: {
    backgroundColor: '#e63032',
    paddingVertical: 70, // Aumenta a altura do botão
    paddingHorizontal: 25, // Mantém o padding horizontal
    borderRadius: 10,
    marginRight: 2,
  },
  filterOptions: {
    position: 'absolute',
    top: 40,
    left: 0,
    backgroundColor: '#fff',
    width: 250,
    padding: 10,
    borderRadius: 8,
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 999,
  },
  darkFilterOptions: {
    backgroundColor: '#444',
  },
  optionText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  lastOptionText: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  icon: {
    width: 24,  // Ajuste o tamanho da imagem
    height: 24, // Ajuste o tamanho da imagem
    resizeMode: 'contain', // Faz com que a imagem se ajuste sem distorção
  }
});

export default ListScreen;
