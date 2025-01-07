import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ isDarkMode }) => {
  const navigation = useNavigation();

  const [buttons] = useState([
    {
      title: "Ver Lista",
      screen: "ListScreen",
      colorDark: "#0077ed",
      colorLight: "#0077ed",
      animation: require("../../assets/GifMenu/VerLista.json"),
    },
    {
      title: "Add Produto",
      screen: "AddProductScreen",
      colorDark: "#4A7042",
      colorLight: "#5d7e62",
      animation: require("../../assets/GifMenu/AddProd.json"),
    },
    {
      title: "Dashboard",
      screen: "DashboardScreen",
      colorDark: "#C42D2F",
      colorLight: "#d9434f",
      animation: require("../../assets/GifMenu/Dash.json"),
    },
    {
      title: "Tratativas",
      screen: "TratarScreen",
      colorDark: "#FF8C00",
      colorLight: "#FFA500",
      animation: require("../../assets/GifMenu/Tratar.json"),
    },
    {
      title: "Export/Import",
      screen: "ExcelScreen",
      colorDark: "#012677",
      colorLight: "#294380",
      animation: require("../../assets/GifMenu/Excel.json"),
    },
    {
      title: "Perfil",
      screen: "ProfileScreen",
      colorDark: "#A69C68",
      colorLight: "#83764c",
      animation: require("../../assets/GifMenu/Profile.json"),
    },
    {
      title: "Configurações",
      screen: "SettingsScreen",
      colorDark: "#3A7F7F",
      colorLight: "#6cb6a5",
      animation: require("../../assets/GifMenu/Config.json"),
    },
    {
      title: "SQL",
      screen: "JsonScreen",
      colorDark: "#b2bfdd",
      colorLight: "#7376a9",
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
  const [buttonAnimations, setButtonAnimations] = useState(() => 
    Array(buttons.length).fill(0).map(() => new Animated.Value(0))
  );

  useEffect(() => {
    console.log("HomeScreen carregada.");
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    setButtonAnimations(Array(buttons.length).fill(0).map(() => new Animated.Value(0)));
  }, [buttons.length]);

  const handleNavigation = (screen) => {
    console.log(`Navegando para: ${screen}`);
    navigation.navigate(screen);
  };

  const handlePressIn = (index) => {
    setPressedButton(index);
    Animated.spring(buttonAnimations[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = (index) => {
    setPressedButton(null);
    Animated.spring(buttonAnimations[index], {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();
  };

  return (
    <View
      style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}
    >
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>
        Menu
      </Text>
      <View style={styles.gridContainer}>
        {buttons.map((button, index) => {
          const animatedStyle = {
            transform: [
              {
                scale: buttonAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95],
                }),
              },
              {
                translateY: buttonAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                }),
              },
            ],
          };

          return (
            <Animated.View key={index} style={[styles.cardContainer, animatedStyle]}>
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
                activeOpacity={0.9}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    position: "relative",
  },
  darkBackground: {
    backgroundColor: "#181818",
  },
  lightBackground: {
    backgroundColor: "#ffffff",
  },
  darkText: {
    color: "#EAEAEA",
  },
  lightText: {
    color: "rgb(48, 48, 48)",
  },
  title: {
    fontSize: 46,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  cardContainer: {
    marginBottom: 16,
    width: "45%",
    marginHorizontal: "2.5%",
  },
  button: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.5)",
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  buttonTitle: {
    fontSize: 16,
    color: "#fafafa",
    textAlign: "center",
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  darkMenuItem: {
    backgroundColor: '#333',
  },
  menuItemText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
