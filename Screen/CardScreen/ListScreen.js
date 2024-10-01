import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import ProductItem from '../Componentes/ProductItem';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ListScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);

  

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const storedProducts = await AsyncStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os produtos. Tente novamente mais tarde.');
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (route.params?.newProduct) {
      const newProduct = {
        ...route.params.newProduct,
        id: Date.now().toString(),
        expirationDate: new Date(route.params.newProduct.expirationDate).toISOString(),
      };

      setProducts((prevProducts) => {
        const productExists = prevProducts.some(
          (p) => p.name === newProduct.name || p.productCode === newProduct.productCode
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
  }, [route.params?.newProduct]);

  const saveProducts = async (productsToSave) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(productsToSave));
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
      Alert.alert('Erro', 'Não foi possível salvar os produtos. Tente novamente mais tarde.');
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

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Excluir Produto',
      'Tem certeza que deseja excluir este produto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: () => {
            setProducts((prevProducts) => {
              const updatedProducts = prevProducts.filter((p) => p.id !== productId);
              saveProducts(updatedProducts);
              return updatedProducts;
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderProductItem = ({ item }) => {
    const daysRemaining = calculateDaysRemaining(item.expirationDate);

    return (
      <View style={styles.productItem}>
        <View style={styles.productContent}>
          <ProductItem
            product={{
              ...item,
              expirationDate: new Date(item.expirationDate).toLocaleDateString(),
              daysRemaining,
            }}
          />
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => {
              Alert.alert('Opções', 'Escolha uma opção', [
                {
                  text: 'Editar',
                  onPress: () => handleEditProduct(item),
                },
                {
                  text: 'Excluir',
                  onPress: () => handleDeleteProduct(item.id),
                  style: 'destructive',
                },
                {
                  text: 'Cancelar',
                  style: 'cancel',
                },
              ]);
            }}
            accessible={true}
            accessibilityLabel="Opções do produto"
            accessibilityHint="Toque para editar ou excluir o produto"
          >
            <MaterialIcons name="more-vert" size={24} color="#FF0000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto.</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F5F5F5', // Cinza claro
  },
  card: {
    backgroundColor: '#FFFFFF', // Branco
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    flex: 1, // Ocupa todo o espaço disponível
  },
  productItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    paddingTop: 10,
  },
  productContent: {
    flexDirection: 'row', // Alinha o conteúdo em linha
    justifyContent: 'space-between', // Espaço entre os elementos
    alignItems: 'center', // Alinha verticalmente ao centro
  },
  optionsButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
});

export default ListScreen;
