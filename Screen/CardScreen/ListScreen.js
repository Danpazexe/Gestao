import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, Alert, TextInput, ActivityIndicator, Image, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductItem from '../Components/ProductItem';
import debounce from 'lodash.debounce';
import AlertDialog from '../Components/AlertDialog';
import { Swipeable } from 'react-native-gesture-handler';
import { Animated, LayoutAnimation } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
  const [showExpiring, setShowExpiring] = useState(false);

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
    const headerButtonStyle = {
      padding: 8,
      borderRadius: 8,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1e88e5' : 'rgba(255, 255, 255, 0.2)',
    };

    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: isDarkMode ? '#2e2e2e' : '#0077ed',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.5,
      },
      headerTitle: 'Lista de Produtos',
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 8 }}>
          <TouchableOpacity 
            style={[
              headerButtonStyle,
              showExpiring && { backgroundColor: isDarkMode ? '#ef5350' : '#ff7043' }
            ]}
            onPress={() => setShowExpiring(!showExpiring)}
          >
            <MaterialIcons 
              name="warning" 
              size={24} 
              color="#FFF" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={headerButtonStyle}
            onPress={() => navigation.navigate('AddProductScreen')}
          >
            <MaterialIcons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isDarkMode, showExpiring]);

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
    const normalizedSearchText = searchText.toLowerCase().trim();
    let filteredProducts = products;
    
    // Filtro de produtos próximos ao vencimento (30 dias)
    if (showExpiring) {
      filteredProducts = products.filter(product => {
        const diasrestantes = calculatediasrestantes(product.validade);
        return diasrestantes <= 30;
      });
    }
    
    if (!normalizedSearchText) {
      return filteredProducts.sort((a, b) => new Date(a.validade) - new Date(b.validade));
    }

    return filteredProducts
      .filter((product) => {
        switch (filterType) {
          case 'descricao':
            return product.descricao?.toLowerCase().includes(normalizedSearchText) ||
                   product.lote?.toLowerCase().includes(normalizedSearchText);
          case 'codprod':
            const codprod = product.codprod?.toString().toLowerCase();
            return codprod?.includes(normalizedSearchText);
          case 'codauxiliar':
            const codauxiliar = product.codauxiliar?.toString().toLowerCase();
            return codauxiliar?.includes(normalizedSearchText);
          default:
            return false;
        }
      })
      .sort((a, b) => {
        // Primeiro ordena por correspondência exata
        const aMatch = a[filterType]?.toString().toLowerCase() === normalizedSearchText;
        const bMatch = b[filterType]?.toString().toLowerCase() === normalizedSearchText;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        
        // Depois ordena por data de validade
        return new Date(a.validade) - new Date(b.validade);
      });
  }, [products, searchText, filterType, showExpiring]);

  const debouncedSearch = debounce((text) => setSearchText(text), 300);

  const renderProductItem = ({ item }) => {
    const diasrestantes = calculatediasrestantes(item.validade);
    let row = [];
    let prevOpenedRow;

    const closeRow = (index) => {
      if (prevOpenedRow && prevOpenedRow !== row[index]) {
        prevOpenedRow.close();
      }
      prevOpenedRow = row[index];
    };

    return (
      <Swipeable
        ref={ref => row[item.id] = ref}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        rightThreshold={40}
        overshootRight={false}
        onSwipeableOpen={() => closeRow(item.id)}
        friction={2}
        useNativeAnimations
      >
        <Animated.View style={[styles.productItem, isDarkMode && styles.darkProductItem]}>
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
  
  const renderRightActions = (progress, dragX, item) => {
    // Animação de entrada dos botões com efeito elástico
    const bounceAnim = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [100, 10, 0],
      extrapolate: 'clamp',
    });

    // Animação de escala com efeito bounce
    const scale = progress.interpolate({
      inputRange: [0, 0.5, 0.8, 1],
      outputRange: [0.5, 1.1, 0.9, 1],
      extrapolate: 'clamp',
    });

    // Animação de opacidade
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.3, 1],
    });

    return (
      <View style={styles.actionsContainer}>
        <Animated.View 
          style={[
            styles.actionsWrapper,
            {
              transform: [
                { translateX: bounceAnim },
                { scale }
              ],
              opacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProduct(item)}
          >
            <View style={styles.actionButtonContent}>
              <MaterialIcons 
                name="edit" 
                size={28} 
                color="#fff"
                style={styles.actionIcon} 
              />
              <Text style={styles.actionButtonText}>Editar</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item)}
          >
            <View style={styles.actionButtonContent}>
              <MaterialIcons 
                name="delete-forever"
                size={30} 
                color="#fff"
                style={styles.actionIcon}
              />
              <Text style={styles.actionButtonText}>Excluir</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFilterVisible((prev) => !prev);
  };

  const setSelectedFilter = (filter) => {
    setFilterType(filter);
    setIsFilterVisible(false);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyList}>
      <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>
        Nenhum produto encontrado.{'\n'}
        Adicione produtos para começar!
      </Text>
    </View>
  );

  const FilterOption = ({ label, icon, isSelected, onPress }) => (
    <TouchableOpacity 
      style={[
        styles.filterOption,
        isSelected && styles.filterOptionSelected,
        isDarkMode && styles.darkFilterOption,
        isSelected && isDarkMode && styles.darkFilterOptionSelected
      ]} 
      onPress={onPress}
    >
      <MaterialIcons 
        name={icon} 
        size={20} 
        color={isSelected ? '#fff' : (isDarkMode ? '#fff' : '#666')} 
      />
      <Text style={[
        styles.optionText,
        isSelected && styles.optionTextSelected,
        isDarkMode && styles.darkOptionText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getPlaceholderText = () => {
    switch (filterType) {
      case 'descricao':
        return 'Buscar por nome ou lote do produto...';
      case 'codprod':
        return 'Buscar por código interno...';
      case 'codauxiliar':
        return 'Buscar por código de barras...';
      default:
        return 'Buscar produto...';
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkBackground]}>
      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}>
          <TouchableOpacity 
            style={[styles.filterButton, isDarkMode && styles.darkFilterButton]} 
            onPress={toggleFilter}
          >
            <MaterialIcons name="filter-list" size={24} color="#FFF" />
          </TouchableOpacity>
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
            placeholder={getPlaceholderText()}
            placeholderTextColor={isDarkMode ? '#666' : '#888'}
            onChangeText={debouncedSearch}
          />
        </View>
        
        {isFilterVisible && (
          <Animated.View style={[styles.filterOptions, isDarkMode && styles.darkFilterOptions]}>
            <FilterOption
              label="Nome"
              icon="text-fields"
              isSelected={filterType === 'descricao'}
              onPress={() => setSelectedFilter('descricao')}
            />
            <FilterOption
              label="Código Interno"
              icon="code"
              isSelected={filterType === 'codprod'}
              onPress={() => setSelectedFilter('codprod')}
            />
            <FilterOption
              label="Código de barras"
              icon="qr-code"
              isSelected={filterType === 'codauxiliar'}
              onPress={() => setSelectedFilter('codauxiliar')}
            />
          </Animated.View>
        )}
      </View>
      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, isDarkMode && styles.darkStatsText]}>
          {filterAndSortProducts.length} {filterAndSortProducts.length === 1 ? 'item' : 'itens'}
          {showExpiring ? ' próximos ao vencimento' : ''}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0077ed" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={filterAndSortProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            filterAndSortProducts.length === 0 ? { flex: 1 } : { paddingBottom: 20 },
            { paddingTop: 8 }
          ]}
          ListEmptyComponent={renderEmptyList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          onScrollBeginDrag={() => setIsFilterVisible(false)}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  searchWrapper: {
    zIndex: 999,
    marginBottom: 12,
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkSearchContainer: {
    backgroundColor: '#2e2e2e',
    borderColor: '#444',
  },
  filterButton: {
    backgroundColor: '#0077ed',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkFilterButton: {
    backgroundColor: '#1e88e5',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },
  darkSearchInput: {
    color: '#fff',
    backgroundColor: 'transparent',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  darkProductItem: {
    backgroundColor: '#333',
  },
  filterOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 1000,
  },
  darkFilterOptions: {
    backgroundColor: '#2e2e2e',
    borderColor: '#444',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#0077ed',
  },
  darkFilterOption: {
    borderColor: '#444',
  },
  darkFilterOptionSelected: {
    backgroundColor: '#1e88e5',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  darkOptionText: {
    color: '#fff',
  },
  swipeable: {
    marginBottom: 8,
  },
  actionsContainer: {
    width: 180,
    height: '100%',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  actionsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 6,
  },
  actionButton: {
    width: 80,
    height: '94%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 3,
  },
  actionButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  actionIcon: {
    marginBottom: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#1976D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  darkEmptyText: {
    color: '#999',
  },
  statsContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  darkStatsText: {
    color: '#aaa',
  },
});

export default ListScreen;
