import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

const HomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Ocultar o header (Título)
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <View style={styles.gridContainer}>
        {/* Card 1: Ver Lista */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#2e97b7" }]}
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
          style={[styles.card, { backgroundColor: "#5d7e62" }]}
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

        {/* Card 3: Configurações */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#6cb6a5" }]}
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

        {/* Card 4: Em Desenvolvimento */}
        <TouchableOpacity style={[styles.card, { backgroundColor: "#be5e46" }]}>
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
    </View>
  );
};

const styles = StyleSheet.create({

  //Fundo do Meu Menu
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#ffffff",
  },

  // Titulo ( menu )
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "rgb(48, 48, 48)",
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
});

export default HomeScreen;
