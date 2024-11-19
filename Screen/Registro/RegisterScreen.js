import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      // Salvando dados no AsyncStorage
      await AsyncStorage.setItem("username", name);
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("password", password);

      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Erro ao registrar:", error);
      Alert.alert("Erro", "Falha ao salvar dados.");
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/FundoApp.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Parte superior decorativa */}
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../assets/LogoApp.png")}
            style={styles.icon}
          />
        </View>
      </View>

      {/* Formulário de cadastro */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Cadastro</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureText(!secureText)}
          >
            <Icon
              name={secureText ? "eye" : "eye-off"}
              size={26}
              color="#A0A0A0"
            />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#A0A0A0"
          secureTextEntry={secureText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Text style={styles.linkText}>
            Já tem uma conta? <Text style={styles.loginText}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    height: "35%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingTop: 50,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F7F7F7",
    marginBottom: 15,
    fontSize: 16,
    color: "#000000",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#000000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 15,
    fontSize: 14,
    color: "#00000A",
  },
  loginText: {
    color: "#000000",
    fontWeight: "bold",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
});

export default RegisterScreen;
