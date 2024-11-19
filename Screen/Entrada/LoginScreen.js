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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    // Limpa os erros anteriores
    setUsernameError("");
    setPasswordError("");

    // Validações simples para campos vazios
    if (!username) {
      setUsernameError("Por favor, insira o nome de usuário.");
    }
    if (!password) {
      setPasswordError("Por favor, insira a senha.");
    }

    // Realizar a verificação usando AsyncStorage
    if (username && password) {
      try {
        // Buscando usuário e senha armazenados no AsyncStorage
        const storedUsername = await AsyncStorage.getItem("username");
        const storedPassword = await AsyncStorage.getItem("password");

        // Verificando se o usuário e senha estão corretos
        if (username === storedUsername) {
          if (password === storedPassword) {
            navigation.navigate("HomeScreen");
          } else {
            setPasswordError("Senha inválida!");
          }
        } else {
          setUsernameError("Usuário não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao verificar credenciais:", error);
        setUsernameError("Erro ao verificar credenciais.");
      }
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

      {/* Formulário de login */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={[styles.input, usernameError && styles.inputError]}
          placeholder="Usuário"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
        />
        {usernameError ? (
          <Text style={styles.errorText}>{usernameError}</Text>
        ) : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
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
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
          <Text style={styles.linkText}>
            Não tem uma conta?{" "}
            <Text style={styles.signupText}>Cadastre-se</Text>
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
  inputError: {
    borderColor: "#FF0000",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 16,
    marginBottom: 15,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#000000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 15,
    fontSize: 14,
    color: "#00000A",
  },
  signupText: {
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

export default LoginScreen;
