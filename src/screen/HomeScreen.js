import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Ocultar o header ( Titulo )
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <View style={styles.gridContainer}>
        {/* Card 1 */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#2e97b7" }]} // Cor personalizada
          onPress={() => handleNavigation("ListScreen")}
        >
          <Image
            style={styles.icon}
            source={require("../../assets/olharlista.png")} // Verifique o caminho da imagem
          />
          <Text style={styles.cardTitle}>Ver Lista</Text>
        </TouchableOpacity>

        {/* Card 2 */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#0b8770" }]} // Cor personalizada
          onPress={() => handleNavigation("AddProductScreen")}
        >
          <Image
            style={styles.icon}
            source={require("../../assets/addproduto.png")} // Verifique o caminho da imagem
          />
          <Text style={styles.cardTitle}>Add Produto</Text>
        </TouchableOpacity>

        {/* Card 3 */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#142f30" }]} // Cor personalizada
          onPress={() => handleNavigation("SettingsScreen")}
        >
          <Image
            style={styles.icon}
            source={require("../../assets/configuracao.png")} // Verifique o caminho da imagem
          />
          <Text style={styles.cardTitle}>Configurações</Text>
        </TouchableOpacity>

        {/* Card 4 */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#b7833a" }]} // Cor personalizada
        >
          <Image
            style={styles.icon}
            source={require("../../assets/manutencao.png")} // Verifique o caminho da imagem
          />
          <Text style={styles.cardTitle}>Em Dev</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#FAFAFA",
  },
  // Titulo da HomeScreen
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  // Propriedades dos Cards ( Espacial )
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  // Propriedades dos Cards ( Cards )
  card: {
    width: "45%",
    margin: 8,
    borderRadius: 25,
    elevation: 8,
    padding: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  // Ícones dos Cards
  icon: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  // Títulos dos Cards
  cardTitle: {
    fontSize: 18,
    color: "#fafafa",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default HomeScreen;
