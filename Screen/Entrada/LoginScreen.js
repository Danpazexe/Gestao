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
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    console.log("Iniciando login...");

    if (!email.trim()) {
      setEmailError("Por favor, insira seu email.");
      console.log("Erro: Email não informado");
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Por favor, insira um email válido.");
      console.log("Erro: Email inválido");
      return;
    }
    if (!password.trim()) {
      setPasswordError("Por favor, insira a senha.");
      console.log("Erro: Senha não informada");
      return;
    }
    setEmailError("");
    setPasswordError("");

    setIsLoading(true);
    console.log("Enviando requisição para o servidor...");

    try {
      const response = await axios.post(
        "https://api.gestao.aviait.com.br/sessions",
        {
          email: email.trim(),
          password: password.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Resposta da API:", response);

      if (response.status === 200 && response.data.message === "User authenticated successfully") {
        console.log("Login bem-sucedido.");
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert(
          "Erro",
          "Login incorreto. Por favor, verifique suas credenciais e tente novamente."
        );
        console.log("Erro: Credenciais incorretas");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Alert.alert("Erro", "Não foi possível fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/FundoApp.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../assets/LogoApp.png")}
            style={styles.icon}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError("");
          }}
        />
        {emailError ? (
          <Text style={styles.errorText}>{emailError}</Text>
        ) : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            placeholder="Senha"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={secureText}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
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

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
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
