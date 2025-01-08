import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, SafeAreaView, Dimensions, BackHandler, ToastAndroid, Platform, Alert } from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ isDarkMode }) => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(50);

  const [buttons] = useState([
    {
      title: "Lista",
      screen: "ListScreen",
      colorDark: "#1E3A8A",
      colorLight: "#2563EB",
      animation: require("../../assets/GifMenu/VerLista.json"),
    },
    {
      title: "Adicionar",
      screen: "AddProductScreen",
      colorDark: "#065F46",
      colorLight: "#059669",
      animation: require("../../assets/GifMenu/AddProd.json"),
    },
    {
      title: "Dashboard",
      screen: "DashboardScreen",
      colorDark: "#991B1B",
      colorLight: "#DC2626",
      animation: require("../../assets/GifMenu/Dash.json"),
    },
    {
      title: "Tratativas",
      screen: "TratarScreen",
      colorDark: "#92400E",
      colorLight: "#D97706",
      animation: require("../../assets/GifMenu/Tratar.json"),
    },
    {
      title: "Excel",
      screen: "ExcelScreen",
      colorDark: "#294380",
      colorLight: "#012677",
      animation: require("../../assets/GifMenu/Excel.json"),
    },
    {
      title: "Perfil",
      screen: "ProfileScreen",
      colorDark: "#5B21B6",
      colorLight: "#7C3AED",
      animation: require("../../assets/GifMenu/Profile.json"),
    },
    {
      title: "Config",
      screen: "SettingsScreen",
      colorDark: "#374151",
      colorLight: "#4B5563",
      animation: require("../../assets/GifMenu/Config.json"),
    },
    {
      title: "SQL",
      screen: null,
      colorDark: "#0F766E",
      colorLight: "#0D9488",
      animation: require("../../assets/GifMenu/Bd.json"),
    },
    {
      title: "Ajustando",
      screen: null,
      colorDark: "#955239",
      colorLight: "#be5e46",
      animation: require("../../assets/GifMenu/Build.json"),
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
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        })
      ]);
    });

    Animated.stagger(50, animations).start();
  }, []);

  const handleNavigation = (screen) => {
    console.log(`Navegando para: ${screen}`);
    navigation.navigate(screen);
  };

  const handlePressIn = (index) => {
    setPressedButton(index);
    Animated.spring(buttonAnimations[index].scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
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
      backgroundColor: "#F3F4F6",
    },
    darkText: {
      color: "#EAEAEA",
    },
    lightText: {
      color: "rgb(48, 48, 48)",
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      textAlign: "center",
      marginVertical: 24,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 8,
    },
    cardContainer: {
      width: '46%',
      aspectRatio: 1,
      marginBottom: 16,
      marginHorizontal: '2%',
    },
    button: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    icon: {
      width: 50,
      height: 50,
      marginBottom: 12,
    },
    buttonTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
      textAlign: "center",
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
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
          Menu
        </Animated.Text>
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
                  style={[
                    styles.button,
                    {
                      backgroundColor: isDarkMode ? button.colorDark : button.colorLight,
                    },
                  ]}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                  onPress={() => button.screen && handleNavigation(button.screen)}
                  activeOpacity={0.7}
                >
                  <LottieView
                    source={button.animation}
                    style={styles.icon}
                    autoPlay
                    loop
                    speed={0.5}
                  />
                  <Text style={styles.buttonTitle}>{button.title}</Text>
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
