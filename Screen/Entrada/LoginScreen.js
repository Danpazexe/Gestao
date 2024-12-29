// LoginScreen.js
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
  // Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Função de validação de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função de validação de senha
  const validatePassword = (password) => {
    // Verifica se a senha tem pelo menos 6 caracteres
    return password.length >= 6;
  };

  // Função de login
  const handleLogin = async () => {
    console.log("[LoginScreen] Iniciando o processo de login...");

    // Validações
    if (!email.trim()) {
      setEmailError("Por favor, insira seu email.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Por favor, insira um email válido.");
      return;
    }
    if (!password.trim()) {
      setPasswordError("Por favor, insira a senha.");
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Resetando erros
    setEmailError("");
    setPasswordError("");
    setIsLoading(true);

    try {
      // Verifica o login fixo
      if (email.trim().toLowerCase() === "admin@gmail.com" && password === "123456") {
        Alert.alert("Login bem-sucedido", "Bem-vindo ao aplicativo!");
        navigation.navigate("HomeScreen");
        return;
      }

      // Caso contrário, tenta a autenticação com a API
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

      console.log("[LoginScreen] Resposta recebida da API:", response.data);

      if (
        response.status === 200 &&
        response.data.message === "User authenticated successfully"
      ) {
        Alert.alert("Login bem-sucedido", "Bem-vindo ao aplicativo!");
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert("Erro no Login", "Credenciais incorretas. Tente novamente.");
        console.error("[LoginScreen] Erro: Credenciais incorretas.");
      }
    } catch (error) {
      console.error("[LoginScreen] Erro ao se comunicar com o servidor:", error.message);
      Alert.alert("Erro no Login", "Não foi possível se conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para renderizar campos de input
  const renderInputField = (placeholder, value, setValue, error, setError, secureText = false) => (
    <>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        value={value}
        onChangeText={(text) => {
          setValue(text);
          if (error) setError("");
        }}
        secureTextEntry={secureText}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );

  return (
    <ImageBackground
      source={require('../../assets/Image/FUNDOAPP.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.topSection}>
          <Image
            source={require("../../assets/Image/LOGOCOMFRASE.png")}
            style={styles.icon}
          />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        {renderInputField("Email", email, setEmail, emailError, setEmailError)}

        <View style={styles.passwordContainer}>
          {renderInputField(
            "Senha", 
            password, 
            setPassword, 
            passwordError, 
            setPasswordError, 
            secureText
          )}
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
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingTop: 50,
  },
  icon: {
    width: 350,
    height: 400,
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
    fontSize: 36,
    fontWeight: "bold",
    color:"rgb(122, 122, 122)",
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
    borderWidth: 2,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 16,
    marginBottom: 15,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#0367A6",
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
    color: "#0367A6",
    fontWeight: "bold",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    top: 12,
    right: 15,
  },
});

export default LoginScreen;
