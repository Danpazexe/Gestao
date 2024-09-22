import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProductItem = ({ product }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.productName}>{product.name}</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Código Interno: </Text>
        <Text style={styles.value}>{product.internalCode}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Quantidade: </Text>
        <Text style={styles.value}>{product.quantity}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>EAN: </Text>
        <Text style={styles.value}>{product.ean}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Lote: </Text>
        <Text style={styles.value}>{product.batch}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Validade: </Text>
        <Text style={styles.value}>{product.expirationDate}</Text>
      </View>

      <View style={styles.remainingDaysContainer}>
        <Text style={styles.daysRemaining}>{product.daysRemaining}</Text>
        <Text style={styles.daysLabel}>Dia(s) restantes</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productName: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 120, // Ajuste conforme necessário
  },
  value: {
    color: '#333',
  },
  remainingDaysContainer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0f7fa',
  },
  daysRemaining: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  daysLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductItem;
