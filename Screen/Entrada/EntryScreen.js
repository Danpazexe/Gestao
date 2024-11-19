import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import appInfo from '../../app.json';

const DotSpinner = () => {
  // Criação dos valores animados para os pontos
  const animatedValues = Array.from({ length: 8 }, () => new Animated.Value(0));

  useEffect(() => {
    // Criação das animações para cada ponto
    const animations = animatedValues.map((value, index) => {
      return Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          delay: index * 55, // Atraso para cada ponto
        }),
        Animated.timing(value, {
          toValue: 0, 
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    });

    // Iniciar a animação em loop
    const loopAnimation = Animated.loop(Animated.stagger(100, animations));
    loopAnimation.start();

    // Limpar a animação ao desmontar o componente
    return () => {
      loopAnimation.stop();
    };
  }, [animatedValues]);

  return (
    <View style={styles.dotSpinner}>
      {animatedValues.map((value, index) => (
        <View key={index} style={[styles.dotSpinnerDot, { transform: [{ rotate: `${index * 45}deg` }] }]}>
          <Animated.View
            style={[
              styles.dotSpinnerDotBefore,
              {
                opacity: value, 
                transform: [{ scale: value }], 
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const EntryScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Esconder o cabeçalho da tela de navegação
    navigation.setOptions({ headerShown: false });

    // Navegar para a loginScreen
    const timer = setTimeout(() => {
      navigation.navigate('LoginScreen');
    }, 3000);

    // Limpar o timer ao desmontar o componente
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      // Imagem de Fundo
      source={require('../../assets/FundoApp.jpg')}
      style={styles.container}
    >
      {/* Logo */}
      <Image source={require('../../assets/LogoApp.png')} style={styles.logo} />

      {/* Mensagem de boas-vindas */}
      <Text style={styles.title}>Bem-vindo ao Gestão+!</Text>

      {/* Informações de versão */}
      <Text style={styles.versionInfo}>
        Versão: {appInfo.expo.version}{'\n'}Desenvolvido por Daniel
      </Text>

      {/* Animação do dot spinner */}
      <DotSpinner />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Fundo do Screen de Carregamento
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // Logo de Entrada
  logo: {
    width: '50%',
    height: undefined,
    aspectRatio: 314 / 222,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  // Título de Entrada
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginVertical: 12,
  },
  // Versão de Entrada
  versionInfo: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginVertical: 8,
  },
  // Carregamento
  dotSpinner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 45,
    width: 45,
    marginTop: 20,
  },
  dotSpinnerDot: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    width: '100%',
  },
  dotSpinnerDotBefore: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
});

export default EntryScreen;
