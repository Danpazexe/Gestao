import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EntryScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    
      navigation.setOptions({ headerShown: false }); // Desabilita o header

    const timer = setTimeout(() => {
      setLoading(false);
      navigation.navigate('HomeScreen');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/Logo.png')}
        style={styles.logo}
      />

      {/* Mensagem de boas-vindas */}
      <Text style={styles.title}>Bem-vindo ao Gestão+!</Text>

      {/* Informações de versão */}
      <Text style={styles.versionInfo}>
        Versão: 0.0.98{'\n'}Desenvolvido por Daniel
      </Text>

      {/* Barra de carregamento */}
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.progressBar} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },

  // logo de Inicio
  logo: {
    width: '80%', // Ajusta a largura para 80% da tela
    height: undefined, // Permite que a altura seja ajustada automaticamente
    aspectRatio: 314 / 222, // Mantém a proporção correta da imagem
    marginBottom: 32,
    resizeMode: 'contain', // Garante que a imagem não seja cortada
  },

  // Título de Boas Vindas 
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
  },

  // Versão de Aplicativo
  versionInfo: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 16,
  },

  // Ícone de Progresso
  progressBar: {
    marginTop: 32,
  },
});

export default EntryScreen;
