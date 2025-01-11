import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, SafeAreaView, Dimensions, BackHandler, ToastAndroid, Platform, Alert } from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ isDarkMode }) => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(50);

  const [buttons] = useState([
    {
      title: "Lista",
      screen: "ListScreen",
      colors: ['#4481eb', '#04befe'],
      icon: "list-alt",
      subtitle: "Visualizar produtos"
    },
    {
      title: "Adicionar",
      screen: "AddProductScreen",
      colors: ['#11998e', '#38ef7d'],
      icon: "add-circle",
      subtitle: "Novo produto"
    },
    {
      title: "Dashboard",
      screen: "DashboardScreen",
      colors: ['#eb3349', '#f45c43'],
      icon: "dashboard",
      subtitle: "Análise de dados"
    },
    {
      title: "Tratativas",
      screen: "TratarScreen",
      colors: ['#f2994a', '#f2c94c'],
      icon: "assignment",
      subtitle: "Produtos tratados"
    },
    {
      title: "Excel",
      screen: "ExcelScreen",
      colors: ['#2193b0', '#6dd5ed'],
      icon: "table-chart",
      subtitle: "Exportar dados"
    },
    {
      title: "Perfil",
      screen: "ProfileScreen",
      colors: ['#834d9b', '#d04ed6'],
      icon: "person",
      subtitle: "Suas informações"
    },
    {
      title: "Config",
      screen: "SettingsScreen",
      colors: ['#4b6cb7', '#182848'],
      icon: "settings",
      subtitle: "Configurações do app"
    },
    {
      title: "SQL",
      screen: "SqlScreen",
      colors: ['#11998e', '#38ef7d'],
      icon: "storage",
      subtitle: "Banco de dados"
    },
    {
      title: "Ajustando",
      screen: null,
      colors: ['#636363', '#a2ab58'],
      icon: "build",
      subtitle: "Em desenvolvimento"
    },
  ]);

  const [pressedButton, setPressedButton] = useState(null);
  const [buttonAnimations] = useState(() => 
    buttons.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(50),
      scale: new Animated.Value(1)
    }))
  );

  useEffect(() => {
    console.log("HomeScreen carregada.");
    navigation.setOptions({ headerShown: false });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    const animations = buttonAnimations.map((anim, index) => {
      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 600,
          delay: index * 120,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 600,
          delay: index * 120,
          useNativeDriver: true,
        })
      ]);
    });

    Animated.stagger(60, animations).start();
  }, []);

  const handleNavigation = (screen) => {
    console.log(`Navegando para: ${screen}`);
    navigation.navigate(screen);
  };

  const handlePressIn = (index) => {
    setPressedButton(index);
    Animated.spring(buttonAnimations[index].scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 25,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = (index) => {
    setPressedButton(null);
    Animated.spring(buttonAnimations[index].scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      padding: 16,
      paddingBottom: 32,
    },
    container: {
      flex: 1,
      padding: 16,
      position: "relative",
    },
    darkBackground: {
      backgroundColor: "#111827",
    },
    lightBackground: {
      backgroundColor: "#F8FAFC",
    },
    darkText: {
      color: "#F1F5F9",
    },
    lightText: {
      color: "#1E293B",
    },
    title: {
      fontSize: 38,
      fontWeight: "800",
      textAlign: "left",
      marginVertical: 8,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      textAlign: 'left',
      letterSpacing: 0.5,
    },
    gridContainer: {
      flexDirection: "column",
      padding: 20,
      paddingTop: 10,
    },
    cardContainer: {
      width: '100%',
      height: 120,
      marginBottom: 25,
      borderRadius: 28,
      overflow: 'hidden',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 15,
      elevation: 12,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      borderRadius: 28,
      padding: 28,
      paddingHorizontal: 32,
      alignItems: "center",
      justifyContent: 'space-between',
      minHeight: 120,
    },
    icon: {
      width: 70,
      height: 70,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
      borderRadius: 22,
    },
    buttonTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.7,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      marginBottom: 6,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      backgroundColor: '#F0F0F0',
      marginBottom: 16,
    },
    darkMenuItem: {
      backgroundColor: '#333',
    },
    menuItemText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: '600',
    },
    darkButton: {
      backgroundColor: '#1F2937',
    },
    darkButtonTitle: {
      color: '#FFFFFF',
    },
    titleContainer: {
      flexDirection: 'column',
      flex: 1,
      paddingRight: 20,
    },
    buttonSubtitle: {
      fontSize: 15,
      color: 'rgba(255, 255, 255, 0.85)',
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 2,
    },
    headerContainer: {
      marginBottom: 35,
      paddingHorizontal: 20,
    },
  });

  return (
    <SafeAreaView 
      style={[styles.safeArea, isDarkMode ? styles.darkBackground : styles.lightBackground]}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.headerContainer}>
          <Animated.Text 
            style={[
              styles.title, 
              isDarkMode ? styles.darkText : styles.lightText,
              {
                opacity: fadeAnim,
                transform: [{ translateY }]
              }
            ]}
          >
            Menu Principal
          </Animated.Text>
          <Text style={styles.subtitle}>Selecione uma opção</Text>
        </View>
        <View style={styles.gridContainer}>
          {buttons.map((button, index) => {
            const animatedStyle = {
              opacity: buttonAnimations[index].opacity,
              transform: [
                { translateY: buttonAnimations[index].translateY },
                { scale: buttonAnimations[index].scale }
              ]
            };

            return (
              <Animated.View 
                key={index} 
                style={[styles.cardContainer, animatedStyle]}
              >
                <TouchableOpacity
                  style={{ width: '100%', height: '100%' }}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  onPress={() => button.screen && handleNavigation(button.screen)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={button.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.button,
                      {
                        shadowColor: button.colors[0],
                        shadowOffset: {
                          width: 0,
                          height: 4,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 4.65,
                        elevation: 8,
                      }
                    ]}
                  >
                    <View style={styles.titleContainer}>
                      <Text style={styles.buttonTitle}>{button.title}</Text>
                      <Text style={styles.buttonSubtitle}>{button.subtitle}</Text>
                    </View>
                    <View style={styles.icon}>
                      <MaterialIcons 
                        name={button.icon} 
                        size={68} 
                        color="#FFFFFF" 
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
