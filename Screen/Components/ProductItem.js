import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Componente para exibir detalhes sobre um produto
const ProductItem = ({ product, isDarkMode }) => {
  // Função melhorada para determinar o texto e cor da validade
  const getDaysToExpirationText = (days) => {
    if (days < 0) {
      return { 
        number: 'Vencido', 
        label: `há ${Math.abs(days)} dia(s)`, 
        color: '#757575',
        backgroundColor: '#ffffff'
      }; 
    } else if (days === 0) {
      return { 
        number: 'Vence', 
        label: 'Hoje', 
        color: '#f44336',
        backgroundColor: '#ffebee'
      }; 
    } else if (days > 0 && days <= 15) {
      return { 
        number: days.toString(), 
        label: 'Dias restantes', 
        color: '#e91e63',
        backgroundColor: '#fce4ec'
      };  
    } else if (days > 15 && days <= 30) {
      return { 
        number: days.toString(), 
        label: 'Dias restantes', 
        color: '#ff9800',
        backgroundColor: '#fff3e0'
      }; 
    } else {
      return { 
        number: days.toString(), 
        label: 'Dias restantes', 
        color: '#4caf50',
        backgroundColor: '#e8f5e9'
      }; 
    }
  };

  // Cálculo dos dias restantes
  const calcularDiasRestantes = () => {
    try {
      // Converte a string de data para partes
      const [dia, mes, ano] = product.validade.split('/').map(Number);
      
      // Cria as datas
      const hoje = new Date();
      const dataValidade = new Date(ano, mes - 1, dia); // mes - 1 porque em JS os meses começam do 0
      
      // Reseta as horas para comparar apenas as datas
      hoje.setHours(0, 0, 0, 0);
      dataValidade.setHours(0, 0, 0, 0);
      
      // Calcula a diferença em dias
      const diffTime = dataValidade.getTime() - hoje.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Erro ao calcular dias restantes:', error);
      return 0;
    }
  };

  const diffDays = calcularDiasRestantes();
  const expirationInfo = getDaysToExpirationText(diffDays);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.productDetails}>
        {/* Informações do Produto */}
        <Text style={[styles.productName, isDarkMode && styles.darkProductName]}>{product.descricao}</Text>

        {/* Detalhes do Produto */}
        <View style={styles.row}>
          <MaterialIcons name="code" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Código Interno:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.codprod}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="format-list-numbered" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Quantidade:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.quantidade}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="qr-code" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>EAN:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.codauxiliar}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="label" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Lote:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.lote}</Text>
        </View>

        <View style={styles.row}>
          <MaterialIcons name="event" size={20} color={isDarkMode ? '#fefeeb' : '#757575'} style={styles.icon} />
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Validade:</Text>
          <Text style={[styles.value, isDarkMode && styles.darkValue]}>{product.validade}</Text>
        </View>
      </View>

      {/* Dias Restantes até a Expiração - Layout melhorado */}
      <View style={[
        styles.remainingDaysContainer, 
        { 
          backgroundColor: isDarkMode ? 'transparent' : expirationInfo.backgroundColor,
          borderColor: expirationInfo.color,
          borderWidth: 2,
          borderRadius: 12,
          padding: 8
        }
      ]}>
        <Text style={[
          styles.diasrestantes, 
          { color: expirationInfo.color }
        ]}>
          {expirationInfo.number}
        </Text>
        <Text style={[
          styles.daysLabel, 
          { color: expirationInfo.color }
        ]}>
          {expirationInfo.label}
        </Text>
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
    marginLeft: 1,
    padding: 10,
  },
 
  diasrestantes: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  daysLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default ProductItem;
