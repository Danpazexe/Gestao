import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

const DashboardScreen = ({ isDarkMode }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      // Carregar produtos armazenados no AsyncStorage
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        console.log('Produtos carregados:', parsedProducts);
        setProducts(parsedProducts);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Ordenar produtos pelos dias restantes (do menor para o maior)
  const sortedProductsByDaysRemaining = [...products].sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Para o gráfico, pegamos apenas os 10 primeiros produtos
  const chartProducts = sortedProductsByDaysRemaining.slice(0, 10);
  const chartProductNames = chartProducts.map(item => item.name);
  const chartProductDaysRemaining = chartProducts.map(item => item.daysRemaining || 0);

  const lineChartData = {
    labels: chartProductNames,
    datasets: [
      {
        data: chartProductDaysRemaining,
        color: (opacity = 1) => isDarkMode ? '#d9434f' : '#C42D2F',
        strokeWidth: 2,
      },
    ],
  };

  const renderProductItem = ({ item }) => (
    <View style={[styles.productCard, isDarkMode ? styles.darkCard : styles.lightCard]}>
      <MaterialIcons name="label" size={24} color={isDarkMode ? '#d9434f' : '#C42D2F'} style={styles.icon} />
      <Text style={[styles.productItem, isDarkMode ? styles.darkText : styles.lightText]}>
        {`${item.name} - ${item.daysRemaining} Dias - ${item.quantity} unid`}
      </Text>
    </View>
  );

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <Text style={[styles.chartTitle, isDarkMode ? styles.darkText : styles.lightText]}>
        Dias Restantes (Gráfico de Linhas)
      </Text>
      <LineChart
        data={lineChartData}
        width={Dimensions.get('window').width - 40}
        height={320}
        yAxisLabel=""
        yAxisSuffix=" dias"
        chartConfig={{
          backgroundColor: isDarkMode ? '#2A2A2A' : '#F7F7F7',
          backgroundGradientFrom: isDarkMode ? '#2A2A2A' : '#F7F7F7',
          backgroundGradientTo: isDarkMode ? '#2A2A2A' : '#F7F7F7',
          decimalPlaces: 0,
          color: (opacity = 1) => isDarkMode ? '#F7F7F7' : '#C42D2F',
          labelColor: (opacity = 1) => isDarkMode ? '#EAEAEA' : '#333333',
          propsForDots: {
            r: "8",
            strokeWidth: "2",
            stroke: isDarkMode ? '#d9434f' : '#C42D2F',
          },
        }}
        style={styles.chart}
        bezier
        withDots
        withInnerLines={true}
        withHorizontalLines={true}
        withVerticalLines={true}
        withVerticalLabels={false}
        onDataPointClick={({ index }) => {
          const product = chartProducts[index];
          Alert.alert(product.name || "Produto sem nome", `Vence em ${product.daysRemaining || 0} Dias`);
        }}
      />
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.title, isDarkMode ? styles.darkTitle : styles.lightTitle]}>Dashboard de Produtos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#D50000" />
      ) : products.length > 0 ? (
        <>
          {renderChart()}
          <View style={styles.productList}>
            <Text style={[styles.productListTitle, isDarkMode ? styles.darkText : styles.lightText]}>
              Lista de Produtos:
            </Text>
            <FlatList
              data={sortedProductsByDaysRemaining}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderProductItem}
              style={styles.innerProductList}
            />
          </View>
        </>
      ) : (
        <Text style={[styles.noData, isDarkMode ? styles.darkText : styles.lightText]}>
          Nenhum dado encontrado
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Estilo principal do contêiner que ocupa todo o espaço disponível
  container: {
    flex: 1,
    padding: 8,
  },
  // Estilo do contêiner em modo escuro
  darkContainer: {
    backgroundColor: '#1A1A1A',
  },
  // Estilo do contêiner em modo claro
  lightContainer: {
    backgroundColor: '#F7F7F7',
  },
  // Estilo do título principal
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  // Estilo do título em modo escuro
  darkTitle: {
    color: '#d9434f',
  },
  // Estilo do título em modo claro
  lightTitle: {
    color: '#C42D2F',
  },
  // Estilo do contêiner do gráfico, centralizando seu conteúdo
  chartContainer: {
    alignItems: 'center',
  },
  // Estilo do título do gráfico
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 8,
  },
  // Estilo do texto em modo escuro
  darkText: {
    color: '#EAEAEA',
  },
  // Estilo do texto em modo claro
  lightText: {
    color: '#333333',
  },
  // Estilo do gráfico, com margem e bordas arredondadas
  chart: {
    marginVertical: 6,
    borderRadius: 16,
  },
  // Estilo para quando não há dados disponíveis
  noData: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
  },
  // Estilo para a lista de produtos, com espaçamento e largura total
  productList: {
    marginTop: 2,
    width: '100%',
    paddingHorizontal: 10,
  },
  // Estilo do título da lista de produtos
  productListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  // Estilo para a lista interna de produtos
  innerProductList: {
    width: '100%',
  },
  // Estilo para cada item da lista de produtos
  productItem: {
    fontSize: 16,
    paddingVertical: 5,
  },
  // Estilo do cartão de cada produto
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    elevation: 2,
  },
  // Estilo do cartão em modo escuro
  darkCard: {
    backgroundColor: '#2A2A2A',
  },
  // Estilo do cartão em modo claro
  lightCard: {
    backgroundColor: '#F7F7F7',
  },
  // Estilo do ícone
  icon: {
    marginRight: 10,
  },
});

export default DashboardScreen;
