import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { MaterialIcons } from '@expo/vector-icons'; 

const HomeScreen = ({ isDarkMode }) => {
  const navigation = useNavigation();

  useEffect(() => {
    // Ocultar o header (Título)
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleExitApp = () => {
    Alert.alert(
      "Sair",
      "Você tem certeza que deseja fechar o aplicativo?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: () => BackHandler.exitApp() }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBackground : styles.lightBackground]}>
      <Text style={[styles.title, isDarkMode ? styles.darkText : styles.lightText]}>Menu</Text>
      <View style={styles.gridContainer}>
        {/* Card 1: Ver Lista */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: isDarkMode ? "#4A90E2" : "#2e97b7" }]}
          onPress={() => handleNavigation("ListScreen")}
        >
          <LottieView
            source={require("../../assets/GifMenu/VerLista.json")} 
            style={styles.icon}
            autoPlay
            loop
            speed={0.3} 
          />
          <Text style={styles.cardTitle}>Ver Lista</Text>
        </TouchableOpacity>

        {/* Card 2: Add Produto */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: isDarkMode ? "#4A7042" : "#5d7e62" }]}
          onPress={() => handleNavigation("AddProductScreen")}
        >
          <LottieView
            source={require("../../assets/GifMenu/AddProd.json")} 
            style={styles.icon}
            autoPlay
            loop
            speed={0.3} 
          />
          <Text style={styles.cardTitle}>Add Produto</Text>
        </TouchableOpacity>

        {/* Card 3: Dashboard */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: isDarkMode ? "#C42D2F" : "#d9434f" }]}
          onPress={() => handleNavigation("DashboardScreen")}
        >
          <LottieView
            source={require("../../assets/GifMenu/Dash.json")} 
            style={styles.icon}
            autoPlay
            loop
            speed={0.3} 
          />
          <Text style={styles.cardTitle}>Dashboard</Text>
        </TouchableOpacity>

        {/* Card 4: Configurações */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: isDarkMode ? "#3A7F7F" : "#6cb6a5" }]}
          onPress={() => handleNavigation("SettingsScreen")}
        >
          <LottieView
            source={require("../../assets/GifMenu/Config.json")} 
            style={styles.icon}
            autoPlay
            loop
            speed={0.3} 
          />
          <Text style={styles.cardTitle}>Configurações</Text>
        </TouchableOpacity>

        {/* Card 5: Em Desenvolvimento */}
        <TouchableOpacity style={[styles.card, { backgroundColor: isDarkMode ? "#955239" : "#be5e46" }]}>
          <LottieView
            source={require("../../assets/GifMenu/Build.json")} 
            style={styles.icon}
            autoPlay
            loop
            speed={0.3} 
          />
          <Text style={styles.cardTitle}>Ajustando</Text>
        </TouchableOpacity>
      </View>

      {/* Botão de saída no canto inferior direito */}
      <TouchableOpacity style={[styles.exitButton, { backgroundColor: isDarkMode ? "#C42D2F" : "#d9434f" }]} onPress={handleExitApp}>
        <MaterialIcons name="exit-to-app" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
  },

  // Estilos para Tema Escuro
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

  // Título do menu
  title: {
    fontSize: 46,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },

  // Config de Grade
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  // Config dos Cards
  card: {
    width: "45%",
    margin: 6,
    borderRadius: 25,
    elevation: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Config dos Ícones
  icon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },

  // Config dos Títulos dos Cards
  cardTitle: {
    fontSize: 16,
    color: "#fafafa",
    textAlign: "center",
    fontWeight: "bold",
  },

  // Botão de sair
  exitButton: {
    position: "absolute",
    bottom: 16,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
