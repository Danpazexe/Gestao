import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import appInfo from '../../app.json';

const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    {[...Array(3)].map((_, i) => (
      <Animatable.View
        key={i}
        animation={{
          0: { scale: 1 },
          0.5: { scale: 1.5 },
          1: { scale: 1 }
        }}
        duration={1000}
        delay={i * 200}
        easing="ease-in-out"
        iterationCount="infinite"
        style={[styles.loadingDot, { marginHorizontal: 5 }]}
      >
        <LinearGradient
          colors={['#4a90e2', '#357abd']}
          style={styles.dot}
        />
      </Animatable.View>
    ))}
  </View>
);

const EntryScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      navigation.navigate('LoginScreen');
    }
  }, [isLoading]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/Image/FUNDOAPP.png')}
        style={styles.backgroundImage}
        blurRadius={1}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.85)']}
          style={styles.gradient}
        >
          <Animated.View 
            style={[styles.content, { opacity: fadeAnim }]}
          >
            <Animatable.Image 
              animation="zoomIn"
              duration={2000}
              source={require('../../assets/Image/LOGO.png')} 
              style={styles.logo}
            />
            <Animatable.Text 
              animation="fadeInUp"
              delay={1000}
              style={styles.title}
            >
              Bem-vindo ao Gestão+
            </Animatable.Text>
            
            {isLoading ? (
              <>
                <LoadingIndicator />
                <Animatable.Text 
                  animation="fadeIn"
                  delay={1500}
                  style={styles.versionInfo}
                >
                  Versão {appInfo.expo.version}
                </Animatable.Text>
                <Animatable.Text 
                  animation="fadeIn"
                  delay={2000}
                  style={styles.developerInfo}
                >
                  Desenvolvido por Daniel Paz
                </Animatable.Text>
              </>
            ) : (
              <>
                <Animatable.Text 
                  animation="fadeIn"
                  style={styles.versionInfo}
                >
                  Versão {appInfo.expo.version}
                </Animatable.Text>
                <Animatable.Text 
                  animation="fadeIn"
                  style={styles.developerInfo}
                >
                  Desenvolvido por Daniel Paz
                </Animatable.Text>
              </>
            )}
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 314 / 222,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 40,
    height: 40,
    alignItems: 'center',
  },
  loadingDot: {
    width: 10,
    height: 10,
  },
  dot: {
    flex: 1,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  versionInfo: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 30,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  developerInfo: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 10,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});

export default EntryScreen;
