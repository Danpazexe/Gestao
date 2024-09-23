import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EntryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // Ocultar o header ( Titulo )
    navigation.setOptions({ headerShown: false });

    // Timer para navegar para a HomeScreen após 5 segundos
    const timer = setTimeout(() => {
      setLoading(false);
      navigation.navigate('HomeScreen');
    }, 5000);

    // Animação dos três pontos
    const dotsInterval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(dotsInterval);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../assets/Logo.png')} style={styles.logo} />

      {/* Mensagem de boas-vindas */}
      <Text style={styles.title}>Bem-vindo ao Gestão+!</Text>

      {/* Informações de versão */}
      <Text style={styles.versionInfo}>
        Versão: 0.0.98{'\n'}Desenvolvido por Daniel
      </Text>

      {/* Animação de pontos crescendo */}
      {loading && (
        <Text style={styles.loadingText}>{dots}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({

  // Fundo do Screen de Carregamento
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fcfcfc',
    padding: 16,
  },
// Logo de Entrada
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 314 / 222,
    marginBottom: 32,
    resizeMode: 'contain',
  },
// Titulo de Entrada
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
  },
// Versão de Entrada
  versionInfo: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 16,
  },
// Carregamento ( em Pontos )
  loadingText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#005a0a',
    marginTop: 32,
  },
});

export default EntryScreen;
