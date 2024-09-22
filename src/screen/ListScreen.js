import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import ProductItem from './ProductItem'; 
import { MaterialIcons } from '@expo/vector-icons'; 

const ListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([
    {

        // exemplo de Produto em Card
      id: '1',
      name: 'Produto 1',
      internalCode: '001',
      quantity: '10',
      batch: 'Lote A',
      expirationDate: '2024-12-31',
      ean: '7891234567890',
      daysRemaining: 10,
    },
]);
    //flag para Abrir EditProduct
    const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product });
  };
  //flag para Deletar Card (Produto) Com alerta
  const handleDeleteProduct = (productId) => {
    Alert.alert(
      "Excluir Produto",
      "Tem certeza que deseja excluir este produto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        { 
          text: "Excluir", 
          onPress: () => setProducts(prevProducts => prevProducts.filter((p) => p.id !== productId)) 
        },
      ]
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productContainer}>
      <ProductItem product={item} />
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={() => {
          Alert.alert(
            "Opções",
            "Escolha uma opção",
            [
              {
                text: "Editar",
                onPress: () => handleEditProduct(item),
              },
              {
                text: "Excluir",
                onPress: () => handleDeleteProduct(item.id),
                style: "destructive",
              },
              {
                text: "Cancelar",
                style: "cancel",
              },
            ]
          );
        }}
        accessible={true}
        accessibilityLabel="Opções do produto"
        accessibilityHint="Toque para editar ou excluir o produto"
      >
        <MaterialIcons name="more-vert" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f7f7f7',
  },
  productContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionsButton: {
    padding: 10,
  },
});

export default ListScreen;
