import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import appInfo from '../../app.json';

const DotSpinner = () => {
  // Lógica
  const animatedValues = Array.from({ length: 8 }, () => new Animated.Value(0));

  useEffect(() => {
    console.log('[DotSpinner] Iniciando animações.');

    const animations = animatedValues.map((value, index) =>
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          delay: index * 55,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const loopAnimation = Animated.loop(Animated.stagger(100, animations));
    loopAnimation.start();

    return () => {
      console.log('[DotSpinner] Parando animações.');
      loopAnimation.stop();
    };
  }, [animatedValues]);

  // Return
  return (
    <View style={styles.dotSpinner}>
      {animatedValues.map((value, index) => (
        <View
          key={index}
          style={[styles.dotSpinnerDot, { transform: [{ rotate: `${index * 45}deg` }] }]}
        >
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
  // Lógica
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[EntryScreen] Configurando opções de navegação.');
    navigation.setOptions({ headerShown: false });

    const loadAppResources = async () => {
      console.log('[EntryScreen] Iniciando carregamento de recursos.');
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulação do carregamento
        console.log('[EntryScreen] Recursos carregados com sucesso.');
      } catch (error) {
        console.error('[EntryScreen] Erro ao carregar recursos:', error);
      } finally {
        setIsLoading(false);
        console.log('[EntryScreen] Estado de carregamento finalizado.');
      }
    };

    loadAppResources();
  }, [navigation]);

  useEffect(() => {
    if (!isLoading) {
      console.log('[EntryScreen] Navegando para LoginScreen.');
      navigation.navigate('LoginScreen');
    }
  }, [isLoading, navigation]);

  // Return
  return (
    <ImageBackground
      source={require('../../assets/Image/FUNDOAPP.png')}
      style={styles.container}
    >
      <Image source={require('../../assets/Image/LOGO.png')} style={styles.logo} />
      <Text style={styles.title}>Bem-vindo ao Gestão+!</Text>
      <Text style={styles.versionInfo}>
        Versão: {appInfo.expo.version}{'\n'}Desenvolvido por Daniel
      </Text>
      {isLoading && <DotSpinner />}
    </ImageBackground>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: '50%',
    height: undefined,
    aspectRatio: 314 / 222,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginVertical: 12,
  },
  versionInfo: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginVertical: 8,
  },
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
