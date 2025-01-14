import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
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
          0: { scale: 1, opacity: 0.3 },
          0.5: { scale: 1.3, opacity: 1 },
          1: { scale: 1, opacity: 0.3 }
        }}
        duration={1500}
        delay={i * 300}
        easing="ease-in-out"
        iterationCount="infinite"
        style={[styles.loadingDot]}
      >
        <LinearGradient
          colors={['#4a90e2', '#357abd', '#1e5799']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      setIsLoading(false);
    }, 3500);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.navigate('LoginScreen');
      });
    }
  }, [isLoading]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/Image/FUNDOAPP.png')}
        style={styles.backgroundImage}
        blurRadius={4}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.9)']}
          style={styles.gradient}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Animatable.Image
              animation="bounceIn"
              duration={1500}
              source={require('../../assets/Image/LOGO.png')}
              style={styles.logo}
            />
            <Animatable.Text
              animation="fadeInUp"
              delay={800}
              style={styles.title}
            >
              Bem-vindo ao Gestão+
            </Animatable.Text>

            {isLoading && (
              <>
                <LoadingIndicator />
                <Animatable.View
                  animation="fadeIn"
                  delay={1200}
                  style={styles.infoContainer}
                >
                  <Text style={styles.versionInfo}>
                    Versão {appInfo.expo.version}
                  </Text>
                  <Text style={styles.developerInfo}>
                    Desenvolvido por Daniel Paz
                  </Text>
                </Animatable.View>
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
    width: '90%',
    paddingHorizontal: 20,
  },
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 50,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dot: {
    flex: 1,
    borderRadius: 6,
  },
  infoContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  versionInfo: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  developerInfo: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EntryScreen;
