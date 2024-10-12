import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Componente para exibir detalhes sobre um produto
const ProductItem = ({ product }) => {
  // Função para determinar o texto e cor de acordo com os dias restantes até a validade
  const getDaysToExpirationText = (days) => {
    if (days === 0) {
      return { number: 'Hoje', label: '', color: '#F44336' }; // Vermelho
    } else if (days > 0 && days <= 15) {
      return { number: days.toString(), label: 'Dia(s)', color: '#E91E63' }; // Vermelho 
    } else if (days > 15 && days <= 30) {
      return { number: days.toString(), label: 'Dia(s)', color: '#FFC107' }; // Amarelo
    } else if (days > 30) {
      return { number: days.toString(), label: 'Dia(s)', color: '#4CAF50' }; // Verde
    } else {
      return { number: '', label: 'Expirado', color: '#B0BEC5' }; // Cinza claro
    }
  };

  const daysRemaining = Number(product.daysRemaining);
  const { number, label, color } = getDaysToExpirationText(daysRemaining);

  return (
    <View style={styles.container}>
      <View style={styles.productDetails}>





        {/* Informações do Produto */}

        <Text style={styles.productName}>{product.name}</Text>

        {/* Detalhes do Produto */}
        
        <View style={styles.row}>
          <MaterialIcons name="code" size={20} color="#757575" style={styles.icon} />
          <Text style={styles.label}>Código Interno:</Text>
          <Text style={styles.value}>{product.internalCode}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="format-list-numbered" size={20} color="#757575" style={styles.icon} />
          <Text style={styles.label}>Quantidade:</Text>
          <Text style={styles.value}>{product.quantity}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="qr-code" size={20} color="#757575" style={styles.icon} />
          <Text style={styles.label}>EAN:</Text>
          <Text style={styles.value}>{product.ean}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="label" size={20} color="#757575" style={styles.icon} />
          <Text style={styles.label}>Lote:</Text>
          <Text style={styles.value}>{product.batch}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="event" size={20} color="#757575" style={styles.icon} />
          <Text style={styles.label}>Validade:</Text>
          <Text style={styles.value}>{product.expirationDate}</Text>
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
  // Estilo do contêiner principal do componente
  container: {
    flexDirection: 'row',
    padding: 6,
    alignItems: 'center'
  },
  // Estilo do contêiner de detalhes do produto
  productDetails: {
    flex: 3,
    paddingRight: 2,
  },
  // Estilo do nome do produto
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#37474F',
  },
  // Estilo das linhas de informações do produto
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  // Estilo dos ícones usados nas linhas de informações do produto
  icon: {
    marginRight: 6,
  },
  // Estilo do rótulo (título) de cada linha de informação do produto
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#757575',
  },
  // Estilo do valor de cada linha de informação do produto
  value: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 5,
  },
  // Estilo do contêiner que exibe os dias restantes até a expiração
  remainingDaysContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilo do número de dias restantes
  daysRemaining: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  // Estilo do rótulo de dias restantes (por exemplo, "Dia(s)")
  daysLabel: {
    fontSize: 25,
    fontWeight: '600',
  },
});

export default ProductItem;
