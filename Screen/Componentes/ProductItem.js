import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Componente para exibir detalhes sobre um produto
const ProductItem = ({ product }) => {

 
  const getDaysToExpirationText = (days) => {
    if (days === 0) {
      return { number: 'Hoje', label: '', color: '#F44336' }; // Vermelho
    } else if (days > 0 && days <= 15) {
      return { number: days.toString(), label: 'Dia(s)', color: '#E91E63' }; // Vermelho mais escuro
    } else if (days > 15 && days <= 30) {
      return { number: days.toString(), label: 'Dia(s)', color: '#FFC107' }; // Amarelo
    } else if (days > 30) {
      return { number: days.toString(), label: 'Dia(s)', color: '#4CAF50' }; // Verde
    } else {
      return { number: '', label: 'Expirado', color: '#B0BEC5' }; // Cinza claro
    }
  };

  // Garantindo que daysRemaining seja um número
  const daysRemaining = Number(product.daysRemaining);

  // Obtendo os detalhes dos dias restantes
  const { number, label, color } = getDaysToExpirationText(daysRemaining);

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

      <View style={[styles.remainingDaysContainer, { borderColor: color }]}>
        <Text style={[styles.daysRemaining, { color: color }]}>{number}</Text>
        <Text style={[styles.daysLabel, { color: color }]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Card Interno
  container: {
    padding: 15,
    backgroundColor: '#F5F5F5', 
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flex: 1,
    borderWidth: 1,
    borderColor: '#BDBDBD', 
  },
  // Nome do Produto
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#b71c1c', 
  },
  // 
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 140,
    color: '#424242', // Cinza escuro para os rótulos
  },
  value: {
    color: '#424242', // Cinza escuro para os valores
  },
  remainingDaysContainer: {
    alignItems: 'center', // Alterado para centralizar o conteúdo
    flex: 1,
    marginTop: 15,
    padding: 10,
    borderTopWidth: 5,
    borderTopColor: '#BDBDBD', // Borda superior cinza
    borderWidth: 5, // Borda adicional com a cor dos dias
  },
  daysRemaining: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center', // Centralizar texto
  },
  daysLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center', // Centralizar texto
  },
});

export default ProductItem;
