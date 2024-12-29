import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

const HomeScreen = ({ isDarkMode }) => {
  const navigation = useNavigation();

  useEffect(() => {
    console.log("HomeScreen carregada.");
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNavigation = (screen) => {
    console.log(`Navegando para: ${screen}`);
    navigation.navigate(screen);
  };

  const cards = [
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
  ];

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkBackground : styles.lightBackground,
      ]}
    >
      <Text
        style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}
      >
        Menu
      </Text>
      <View style={styles.gridContainer}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              {
                backgroundColor: isDarkMode
                  ? card.colorDark
                  : card.colorLight,
              },
            ]}
            onPress={() => card.screen && handleNavigation(card.screen)}
          >
            <LottieView
              source={card.animation}
              style={styles.icon}
              autoPlay
              loop
              speed={0.3}
            />
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    position: 'relative',
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
  card: {
    width: "45%",
    margin: 6,
    borderRadius: 25,
    elevation: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    color: "#fafafa",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default HomeScreen;
