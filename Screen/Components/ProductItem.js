import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Componente para exibir detalhes sobre um produto
const ProductItem = ({ product, isDarkMode }) => {
  // Função para determinar o texto e cor de acordo com os dias restantes até a validade
  const getDaysToExpirationText = (days) => {
    if (days === 0) {
      return { number: 'Hoje', label: '', color: '#F44336' }; 
    } else if (days > 0 && days <= 15) {
      return { number: days.toString(), label: 'Dia(s)', color: '#E91E63' };  
    } else if (days > 15 && days <= 30) {
      return { number: days.toString(), label: 'Dia(s)', color: '#FFC107' }; 
    } else if (days > 30) {
      return { number: days.toString(), label: 'Dia(s)', color: '#4CAF50' }; 
    } else {
      return { number: '', label: 'Expirado', color: '#B0BEC5' }; 
    }
  };

  const daysRemaining = Number(product.daysRemaining);
  const { number, label, color } = getDaysToExpirationText(daysRemaining);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.productDetails}>
        {/* Informações do Produto */}
        <Text style={[styles.productName, isDarkMode && styles.darkProductName]}>{product.name}</Text>

        {/* Detalhes do Produto */}
        <View style={styles.row}>
          <MaterialIcons name="code" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Código Interno:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.internalCode}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="format-list-numbered" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Quantidade:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.quantity}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="qr-code" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>EAN:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.ean}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="label" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Lote:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.batch}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="event" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Validade:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.expirationDate}</Text>
        </View>
      </View>

      {/* Dias Restantes até a Expiração */}
      <View style={[styles.remainingDaysContainer, { borderColor: color }]}>
        <Text style={[styles.daysRemaining, { color: color }]}>{number}</Text>
        <Text style={[styles.daysLabel, { color: color }]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 10,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#2e2e2e', 
  },
  
  productDetails: {
    flex: 3,
    paddingRight: 3,
  },
  
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#37474F',
  },
  darkProductName: {
    color: '#2b879e', 
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  
  icon: {
    marginRight: 6,
  },
  
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#757575',
  },
  darkLabel: {
    color: '#f8f4e4', 
  },
  
  value: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 5,
  },
  darkValue: {
    color: '#a5b3aa', 
  },
  
  remainingDaysContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  daysRemaining: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  
  daysLabel: {
    fontSize: 25,
    fontWeight: '600',
  },
});

export default ProductItem;
