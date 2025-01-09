import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, TextInput, ActivityIndicator, Image, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductItem from '../Components/ProductItem';
import debounce from 'lodash.debounce';
import { Swipeable } from 'react-native-gesture-handler';
import { Animated, LayoutAnimation } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

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
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar produtos',
        text2: 'Não foi possível carregar os produtos.',
        visibilityTime: 3000,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (productsToSave) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(productsToSave));
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar produtos',
        text2: 'Não foi possível salvar os produtos.',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  return { products, setProducts, loadProducts, saveProducts, loading };
};

const getModalStyles = (isDarkMode) => StyleSheet.create({
  quantitySection: {
    backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
});

const TreatmentModal = ({ 
  visible, 
  onClose, 
  onTreat, 
  selectedProduct, 
  isDarkMode,
  quantity,
  onQuantityChange 
}) => {
  const modalStyles = getModalStyles(isDarkMode);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalView, isDarkMode && styles.darkModalView]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Tratativa de Produto
            </Text>
            <Text style={[styles.productName, isDarkMode && { color: '#999' }]} numberOfLines={1}>
              {selectedProduct?.descricao}
            </Text>
          </View>

          <View style={[styles.quantitySection, isDarkMode && styles.darkQuantitySection]}>
            <View style={styles.quantityInfo}>
              <Text style={[styles.quantityLabel, isDarkMode && { color: '#999' }]}>
                Estoque Atual:
              </Text>
              <Text style={[styles.quantityValue, isDarkMode && styles.darkText]}>
                {selectedProduct?.quantidade || 0} unidades
              </Text>
            </View>
            
            <View style={styles.quantityInputWrapper}>
              <Text style={[styles.quantityInputLabel, isDarkMode && { color: '#999' }]}>
                Quantidade a tratar:
              </Text>
              <TextInput
                style={[styles.quantityInput, isDarkMode && styles.darkQuantityInput]}
                value={quantity}
                onChangeText={onQuantityChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                textAlign="center"
              />
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.treatmentButton, styles.sellButton]}
              onPress={() => onTreat(selectedProduct, 'sold')}
            >
              <MaterialIcons name="shopping-cart" size={24} color="#FFF" />
              <Text style={styles.treatmentButtonText}>Vendido</Text>
            </Pressable>

            <Pressable
              style={[styles.treatmentButton, styles.exchangeButton]}
              onPress={() => onTreat(selectedProduct, 'exchanged')}
            >
              <MaterialIcons name="swap-horiz" size={24} color="#FFF" />
              <Text style={styles.treatmentButtonText}>Trocado</Text>
            </Pressable>

            <Pressable
              style={[styles.treatmentButton, styles.returnButton]}
              onPress={() => onTreat(selectedProduct, 'returned')}
            >
              <MaterialIcons name="assignment-return" size={24} color="#FFF" />
              <Text style={styles.treatmentButtonText}>Devolvido</Text>
            </Pressable>

            <Pressable
              style={[styles.treatmentButton, styles.expiredButton]}
              onPress={() => onTreat(selectedProduct, 'expired')}
            >
              <MaterialIcons name="error" size={24} color="#FFF" />
              <Text style={styles.treatmentButtonText}>Vencido</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.cancelButton, isDarkMode && styles.darkCancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, isDarkMode && styles.darkText]}>
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const ListScreen = ({ route, navigation, isDarkMode }) => {
  const { products, setProducts, loadProducts, saveProducts, loading } = useProducts();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('descricao');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [treatmentModalVisible, setTreatmentModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [treatmentQuantity, setTreatmentQuantity] = useState('');
  const [sortOrder, setSortOrder] = useState({ field: 'validade', direction: 'asc' });
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
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
          Toast.show({
            type: 'info',
            text1: 'Produto já existe',
            text2: 'Este produto já está na lista.',
            visibilityTime: 3000,
            position: 'top',
          });
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
    setDeleteConfirmationVisible(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      setProducts(updatedProducts);
      await saveProducts(updatedProducts);
      
      Toast.show({
        type: 'success',
        text1: 'Produto excluído',
        text2: 'O produto foi excluído com sucesso!',
        visibilityTime: 2000,
        position: 'top',
      });
    }
    setDeleteConfirmationVisible(false);
    setProductToDelete(null);
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
    
    // Primeiro, filtra os produtos não tratados
    let filteredProducts = products.filter(product => !product.status || product.status !== 'treated');
    
    // Filtro de produtos próximos ao vencimento (30 dias)
    if (showExpiring) {
      filteredProducts = filteredProducts.filter(product => {
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

  const handleModalClose = useCallback(() => {
    setTreatmentModalVisible(false);
    setTreatmentQuantity('');
  }, []);

  const handleQuantityChange = useCallback((value) => {
    setTreatmentQuantity(value);
  }, []);

  const sortProducts = (products) => {
    return [...products].sort((a, b) => {
      const { field, direction } = sortOrder;
      const multiplier = direction === 'asc' ? 1 : -1;

      switch (field) {
        case 'validade':
          return multiplier * (new Date(a.validade) - new Date(b.validade));
        case 'quantidade':
          return multiplier * (a.quantidade - b.quantidade);
        case 'nome':
          return multiplier * a.descricao.localeCompare(b.descricao);
        default:
          return 0;
      }
    });
  };

  const toggleSort = (field) => {
    setSortOrder(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortOptions = () => {
    const dividerStyle = {
      width: 1,
      backgroundColor: isDarkMode ? '#444' : '#e0e0e0',
      marginHorizontal: 2,
    };

    // Função auxiliar para retornar o ícone correto de ordenação
    const getSortIcon = (field) => {
      if (sortOrder.field === field) {
        return sortOrder.direction === 'asc' ? 'arrow-upward' : 'arrow-downward';
      }
      return null;
    };

    return (
      <View style={[styles.sortContainer, isDarkMode && styles.darkSortContainer]}>
        <TouchableOpacity 
          style={[
            styles.sortButton, 
            sortOrder.field === 'validade' && styles.activeSortButton
          ]}
          onPress={() => toggleSort('validade')}
        >
          <MaterialIcons 
            name="event" 
            size={16} 
            color={sortOrder.field === 'validade' ? '#FFF' : isDarkMode ? '#FFF' : '#666'} 
          />
          <Text style={[
            styles.sortButtonText,
            isDarkMode && styles.darkSortButtonText,
            sortOrder.field === 'validade' && styles.activeSortButtonText
          ]}>
            Validade
            {sortOrder.field === 'validade' && (
              <MaterialIcons 
                name={getSortIcon('validade')}
                size={12}
                color="#FFF"
                style={{ marginLeft: 2 }}
              />
            )}
          </Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity 
          style={[
            styles.sortButton, 
            sortOrder.field === 'quantidade' && styles.activeSortButton
          ]}
          onPress={() => toggleSort('quantidade')}
        >
          <MaterialIcons 
            name="sort" 
            size={16} 
            color={sortOrder.field === 'quantidade' ? '#FFF' : isDarkMode ? '#FFF' : '#666'} 
          />
          <Text style={[
            styles.sortButtonText,
            isDarkMode && styles.darkSortButtonText,
            sortOrder.field === 'quantidade' && styles.activeSortButtonText
          ]}>
            Qtd
            {sortOrder.field === 'quantidade' && (
              <MaterialIcons 
                name={getSortIcon('quantidade')}
                size={12}
                color="#FFF"
                style={{ marginLeft: 2 }}
              />
            )}
          </Text>
        </TouchableOpacity>

        <View style={dividerStyle} />

        <TouchableOpacity 
          style={[
            styles.sortButton, 
            sortOrder.field === 'nome' && styles.activeSortButton
          ]}
          onPress={() => toggleSort('nome')}
        >
          <MaterialIcons 
            name="sort-by-alpha" 
            size={16} 
            color={sortOrder.field === 'nome' ? '#FFF' : isDarkMode ? '#FFF' : '#666'} 
          />
          <Text style={[
            styles.sortButtonText,
            isDarkMode && styles.darkSortButtonText,
            sortOrder.field === 'nome' && styles.activeSortButtonText
          ]}>
            Nome
            {sortOrder.field === 'nome' && (
              <MaterialIcons 
                name={getSortIcon('nome')}
                size={12}
                color="#FFF"
                style={{ marginLeft: 2 }}
              />
            )}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
        renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        leftThreshold={40}
        rightThreshold={40}
        overshootLeft={false}
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
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => {
              setSelectedProduct(item);
              setTreatmentModalVisible(true);
            }}
          >
            <View style={styles.actionButtonContent}>
              <MaterialIcons 
                name="check-circle" 
                size={24} 
                color="#FFF"
                style={styles.actionIcon}
              />
              <Text style={styles.actionButtonText}>Tratar</Text>
            </View>
          </TouchableOpacity>
          
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

  const renderLeftActions = (progress, dragX, item) => {
    const translateX = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
    });

    const scale = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.8, 1],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.3, 1],
    });

    return (
      <View style={styles.leftActionsContainer}>
        <Animated.View 
          style={[
            styles.leftActionsWrapper,
            {
              transform: [
                { translateX },
                { scale }
              ],
              opacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => {
              setSelectedProduct(item);
              setTreatmentModalVisible(true);
            }}
          >
            <View style={styles.actionButtonContent}>
              <MaterialIcons 
                name="check-circle" 
                size={24} 
                color="#FFF"
                style={styles.actionIcon}
              />
              <Text style={styles.actionButtonText}>Tratar</Text>
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
        styles.filterOptionText,
        isSelected && styles.filterOptionTextSelected,
        isDarkMode && styles.darkFilterOptionText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <View style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}>
        <TouchableOpacity 
          style={[styles.filterButton, isDarkMode && styles.darkFilterButton]} 
          onPress={toggleFilter}
        >
          <MaterialIcons 
            name={filterType === 'descricao' ? 'text-fields' : 
                  filterType === 'codprod' ? 'code' : 'qr-code'} 
            size={24} 
            color="#FFF" 
          />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder={
            filterType === 'descricao' ? 'Buscar por nome do produto...' :
            filterType === 'codprod' ? 'Buscar por código interno...' :
            'Buscar por código EAN...'
          }
          placeholderTextColor={isDarkMode ? '#666' : '#888'}
          onChangeText={debouncedSearch}
          keyboardType={filterType !== 'descricao' ? 'numeric' : 'default'}
        />
      </View>
      
      {isFilterVisible && (
        <Animated.View style={[styles.filterOptions, isDarkMode && styles.darkFilterOptions]}>
          <FilterOption
            label="Nome do Produto"
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
            label="Código EAN"
            icon="qr-code"
            isSelected={filterType === 'codauxiliar'}
            onPress={() => setSelectedFilter('codauxiliar')}
          />
        </Animated.View>
      )}
    </View>
  );

  const handleTreatProduct = async (product, treatmentType) => {
    try {
      const quantity = parseInt(treatmentQuantity);
      
      if (isNaN(quantity) || quantity <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Quantidade Inválida',
          text2: 'Por favor, insira uma quantidade válida',
          visibilityTime: 3000,
          position: 'top',
        });
        return;
      }

      if (quantity > product.quantidade) {
        Toast.show({
          type: 'error',
          text1: 'Quantidade Excede Estoque',
          text2: 'A quantidade não pode ser maior que o estoque disponível',
          visibilityTime: 3000,
          position: 'top',
        });
        return;
      }

      const updatedProducts = products.map(p => {
        if (p.id === product.id) {
          const remainingQuantity = p.quantidade - quantity;
          
          if (remainingQuantity > 0) {
            // Se ainda sobrar quantidade, cria um novo produto tratado e atualiza o original
            const treatedProduct = {
              ...p,
              id: Date.now().toString(), // Novo ID para o produto tratado
              status: 'treated',
              treatmentType,
              treatmentDate: new Date().toISOString(),
              quantidade: quantity,
            };
            
            // Atualiza a quantidade do produto original
            p.quantidade = remainingQuantity;
            
            // Retorna um array com ambos os produtos
            return [p, treatedProduct];
          } else {
            // Se toda a quantidade foi tratada, apenas marca o produto como tratado
            return [{
              ...p,
              status: 'treated',
              treatmentType,
              treatmentDate: new Date().toISOString(),
              quantidade: quantity,
            }];
          }
        }
        return [p];
      });

      // Flatten o array de produtos
      const flattenedProducts = updatedProducts.flat();

      await AsyncStorage.setItem('products', JSON.stringify(flattenedProducts));
      setProducts(flattenedProducts);
      setTreatmentModalVisible(false);
      setSelectedProduct(null);
      setTreatmentQuantity('');

      Toast.show({
        type: 'success',
        text1: 'Produto Tratado',
        text2: `${quantity} unidades ${
          treatmentType === 'sold' ? 'vendidas' : 
          treatmentType === 'exchanged' ? 'trocadas' : 
          treatmentType === 'returned' ? 'devolvidas' : 
          'vencidas'
        }`,
        visibilityTime: 2000,
        position: 'top',
      });
    } catch (error) {
      console.error('Erro ao tratar produto:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível tratar o produto',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkBackground]}>
      {renderSearchBar()}
      {renderSortOptions()}
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
          data={sortProducts(filterAndSortProducts)}
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
      <TreatmentModal
        visible={treatmentModalVisible}
        onClose={handleModalClose}
        onTreat={handleTreatProduct}
        selectedProduct={selectedProduct}
        isDarkMode={isDarkMode}
        quantity={treatmentQuantity}
        onQuantityChange={handleQuantityChange}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmationVisible}
        onRequestClose={() => setDeleteConfirmationVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, isDarkMode && styles.darkModalView]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                Confirmar Exclusão
              </Text>
              <Text style={[styles.productName, isDarkMode && { color: '#999' }]} numberOfLines={2}>
                {productToDelete?.descricao}
              </Text>
            </View>

            <Text style={[styles.confirmationText, isDarkMode && { color: '#999' }]}>
              Tem certeza que deseja excluir este produto?
            </Text>

            <View style={styles.confirmationButtons}>
              <Pressable
                style={[styles.confirmationButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteConfirmationVisible(false);
                  setProductToDelete(null);
                }}
              >
                <MaterialIcons name="close" size={24} color="#FFF" />
                <Text style={styles.confirmationButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmationButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <MaterialIcons name="delete" size={24} color="#FFF" />
                <Text style={styles.confirmationButtonText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  darkFilterButton: {
    backgroundColor: '#1e88e5',
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
  filterOptionText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  darkFilterOptionText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  darkModalView: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  darkText: {
    color: '#FFFFFF',
  },
  productName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  quantitySection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  darkQuantitySection: {
    backgroundColor: '#2A2A2A',
  },
  quantityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#666',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityInputWrapper: {
    alignItems: 'center',
  },
  quantityInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityInput: {
    width: '50%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  darkQuantityInput: {
    backgroundColor: '#333',
    color: '#FFF',
    borderColor: '#404040',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  treatmentButton: {
    width: '48%',
    height: 80,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sellButton: {
    backgroundColor: '#4CAF50',
  },
  exchangeButton: {
    backgroundColor: '#2196F3',
  },
  returnButton: {
    backgroundColor: '#FF9800',
  },
  expiredButton: {
    backgroundColor: '#FF5252',
  },
  treatmentButtonText: {
    color: '#FFF',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  darkCancelButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#404040',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  leftActionsContainer: {
    width: 100,
    height: '100%',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginLeft: 10,
  },
  leftActionsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 6,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  darkSortContainer: {
    backgroundColor: '#2e2e2e',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  activeSortButton: {
    backgroundColor: '#0077ed',
  },
  sortButtonText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  darkSortButtonText: {
    color: '#fff',
  },
  activeSortButtonText: {
    color: '#fff',
  },
  confirmationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  confirmationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  confirmationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ListScreen;
