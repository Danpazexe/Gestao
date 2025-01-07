import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = ({ isDarkMode }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // '7', '30', '90' dias

  // Função para carregar produtos
  const loadProducts = async () => {
    try {
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar ao puxar para baixo
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Função para calcular dias restantes
  const calculateDaysRemaining = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Dados para o gráfico de pizza
  const getPieChartData = () => {
    if (products.length === 0) {
      return [{
        name: 'Sem produtos',
        population: 1,
        color: isDarkMode ? '#A78BFA' : '#7C4DFF',
        legendFontColor: isDarkMode ? '#E0E0E0' : '#333333',
      }];
    }

    const expired = products.filter(p => p.status === 'treated' && p.treatmentType === 'expired').length;
    const sold = products.filter(p => p.status === 'treated' && p.treatmentType === 'sold').length;
    const exchanged = products.filter(p => p.status === 'treated' && p.treatmentType === 'exchanged').length;
    const returned = products.filter(p => p.status === 'treated' && p.treatmentType === 'returned').length;
    const nearExpiry = products.filter(p => {
      const days = calculateDaysRemaining(p.validade);
      return !p.status && days > 0 && days <= 30;
    }).length;
    const safe = products.filter(p => {
      const days = calculateDaysRemaining(p.validade);
      return !p.status && days > 30;
    }).length;

    return [
      {
        name: 'Vendidos',
        population: sold,
        color: isDarkMode ? '#4ADE80' : '#4CAF50',
        legendFontColor: isDarkMode ? '#E0E0E0' : '#333333',
      },
      {
        name: 'Trocados',
        population: exchanged,
        color: isDarkMode ? '#60A5FA' : '#2196F3',
        legendFontColor: isDarkMode ? '#E0E0E0' : '#333333',
      },
      {
        name: 'Devolvidos',
        population: returned,
        color: isDarkMode ? '#FFB74D' : '#FF9800',
        legendFontColor: isDarkMode ? '#E0E0E0' : '#333333',
      },
      {
        name: 'Vencidos',
        population: expired,
        color: isDarkMode ? '#FF6B6B' : '#FF4444',
        legendFontColor: isDarkMode ? '#E0E0E0' : '#333333',
      },
      {
        name: 'Próx. Vencimento',
        population: nearExpiry,
        color: isDarkMode ? '#FFD93D' : '#FFA000',
        legendFontColor: isDarkMode ? '#E0E0E0' : '#333333',
      },
      {
        name: 'Normais',
        population: safe,
        color: isDarkMode ? '#A78BFA' : '#7C4DFF',
        legendFontColor: isDarkMode ? '#E0E0E0' : '#333333',
      },
    ];
  };

  // Dados para o gráfico de linha
  const getLineChartData = () => {
    if (products.length === 0) {
      return {
        labels: ['Sem dados'],
        datasets: [{
          data: [0],
          color: (opacity = 1) => isDarkMode ? '#6366F1' : '#3F51B5',
          strokeWidth: 2,
        }],
      };
    }

    const sortedProducts = [...products]
      .sort((a, b) => calculateDaysRemaining(a.validade) - calculateDaysRemaining(b.validade))
      .slice(0, 5);

    return {
      labels: sortedProducts.map(p => p.descricao.substring(0, 8) + '...'),
      datasets: [{
        data: sortedProducts.map(p => calculateDaysRemaining(p.validade)),
        color: (opacity = 1) => isDarkMode ? '#6366F1' : '#3F51B5',
        strokeWidth: 2,
      }],
    };
  };

  // Componente de Card de Estatística
  const StatCard = ({ title, value, icon, iconFamily = 'MaterialCommunityIcons', color }) => (
    <View style={[styles.statCard, isDarkMode && styles.darkStatCard]}>
      <View style={styles.statIconContainer}>
        {iconFamily === 'MaterialCommunityIcons' ? (
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        ) : (
          <MaterialIcons name={icon} size={24} color={color} />
        )}
      </View>
      <Text style={[styles.statValue, isDarkMode && styles.darkText]}>{value}</Text>
      <Text style={[styles.statTitle, isDarkMode && styles.darkText]}>{title}</Text>
    </View>
  );

  // Componente de Botão de Período
  const PeriodButton = ({ period, label }) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.selectedPeriodButton,
        isDarkMode && styles.darkPeriodButton,
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.selectedPeriodButtonText,
          isDarkMode && styles.darkText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#6366F1' : '#3F51B5'} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.darkContainer]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={isDarkMode ? ['#1A237E', '#303F9F'] : ['#3F51B5', '#5C6BC0']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Visão Geral dos Produtos</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total de Produtos"
            value={products.length}
            icon="package-variant"
            iconFamily="MaterialCommunityIcons"
            color={isDarkMode ? '#6366F1' : '#3F51B5'}
          />
          <StatCard
            title="Próx. ao Vencimento"
            value={products.filter(p => {
              const days = calculateDaysRemaining(p.validade);
              return !p.status && days > 0 && days <= 30;
            }).length}
            icon="alert-circle"
            iconFamily="MaterialCommunityIcons"
            color={isDarkMode ? '#FFD93D' : '#FFA000'}
          />
          <StatCard
            title="Vencidos"
            value={products.filter(p => p.status === 'treated' && p.treatmentType === 'expired').length}
            icon="alert-octagon"
            iconFamily="MaterialCommunityIcons"
            color={isDarkMode ? '#FF6B6B' : '#FF4444'}
          />
          <StatCard
            title="Vendidos"
            value={products.filter(p => p.status === 'treated' && p.treatmentType === 'sold').length}
            icon="cart"
            iconFamily="MaterialCommunityIcons"
            color={isDarkMode ? '#4ADE80' : '#4CAF50'}
          />
          <StatCard
            title="Trocados"
            value={products.filter(p => p.status === 'treated' && p.treatmentType === 'exchanged').length}
            icon="swap-horizontal"
            iconFamily="MaterialCommunityIcons"
            color={isDarkMode ? '#60A5FA' : '#2196F3'}
          />
          <StatCard
            title="Devolvidos"
            value={products.filter(p => p.status === 'treated' && p.treatmentType === 'returned').length}
            icon="keyboard-return"
            iconFamily="MaterialCommunityIcons"
            color={isDarkMode ? '#FFB74D' : '#FF9800'}
          />
        </View>

        {/* Gráfico de Pizza */}
        <View style={[styles.chartCard, isDarkMode && styles.darkChartCard]}>
          <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
            Distribuição por Status
          </Text>
          <PieChart
            data={getPieChartData()}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Gráfico de Linha */}
        <View style={[styles.chartCard, isDarkMode && styles.darkChartCard]}>
          <Text style={[styles.chartTitle, isDarkMode && styles.darkText]}>
            Produtos Próximos ao Vencimento
          </Text>
          <View style={styles.periodButtonsContainer}>
            <PeriodButton period="7" label="7 dias" />
            <PeriodButton period="30" label="30 dias" />
            <PeriodButton period="90" label="90 dias" />
          </View>
          <LineChart
            data={getLineChartData()}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => isDarkMode ? `rgba(99, 102, 241, ${opacity})` : `rgba(63, 81, 181, ${opacity})`,
              labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: isDarkMode ? "#6366F1" : "#3F51B5"
              }
            }}
            bezier
            style={styles.lineChart}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkStatCard: {
    backgroundColor: '#1E1E1E',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666666',
  },
  darkText: {
    color: '#E0E0E0',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkChartCard: {
    backgroundColor: '#1E1E1E',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  periodButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  darkPeriodButton: {
    backgroundColor: '#333333',
  },
  selectedPeriodButton: {
    backgroundColor: '#3F51B5',
  },
  periodButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  selectedPeriodButtonText: {
    color: '#FFFFFF',
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default DashboardScreen;
