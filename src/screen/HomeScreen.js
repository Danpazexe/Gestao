import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]); 

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text> 
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("ListScreen")} 
        >
          <Image style={styles.icon} source={require('../../assets/olharlista.png')} />
          <Text style={styles.cardTitle}>Ver Lista</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("AddProductScreen")} 
        >
          <Image style={styles.icon} source={require('../../assets/addproduto.png')} />
          <Text style={styles.cardTitle}>Add Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleNavigation("SettingsScreen")} 
        >
          <Image style={styles.icon} source={require('../../assets/configuracao.png')} />
          <Text style={styles.cardTitle}>Configurações</Text>
        </TouchableOpacity>

        {/* Outros cartões */}
        <TouchableOpacity style={styles.card}>
          <Image style={styles.icon} source={require('../../assets/manutencao.png')} />
          <Text style={styles.cardTitle}>Em Construção</Text>
        </TouchableOpacity>
        
        {/* Adicione mais cartões conforme necessário */}
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
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333", // Cor do título
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
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 25,
    elevation: 8,
    padding: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default HomeScreen;
