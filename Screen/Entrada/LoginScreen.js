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
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import Toast from 'react-native-toast-message';

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
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira seu email.',
      });
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError("Por favor, insira um email válido.");
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira um email válido.',
      });
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
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Bem-vindo ao aplicativo!',
        });
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
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Bem-vindo ao aplicativo!',
        });
        navigation.navigate("HomeScreen");
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro no Login',
          text2: 'Credenciais incorretas. Tente novamente.',
        });
        console.error("[LoginScreen] Erro: Credenciais incorretas.");
      }
    } catch (error) {
      console.error("[LoginScreen] Erro ao se comunicar com o servidor:", error.message);
      Toast.show({
        type: 'error',
        text1: 'Erro no Login',
        text2: 'Não foi possível se conectar ao servidor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para renderizar campos de input
  const renderInputField = (placeholder, value, setValue, error, setError, secureText = false, icon) => (
    <View style={styles.inputWrapper}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <Icon name={icon} size={20} color="#0367A6" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          value={value}
          onChangeText={(text) => {
            setValue(text);
            if (error) setError("");
          }}
          secureTextEntry={secureText}
        />
        {placeholder === "Senha" && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureText(!secureText)}
          >
            <Icon
              name={secureText ? "eye" : "eye-off"}
              size={22}
              color="#0367A6"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/Image/FUNDOAPP.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.topSection}>
          <Image
            source={require("../../assets/Image/LOGOCOMFRASE.png")}
            style={styles.icon}
          />
        </View>

        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.formBox}>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

            {renderInputField("Email", email, setEmail, emailError, setEmailError, false, "email")}
            {renderInputField("Senha", password, setPassword, passwordError, setPasswordError, secureText, "lock")}

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
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  topSection: {
    height: "35%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  icon: {
    width: 300,
    height: 350,
    resizeMode: "contain",
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0367A6",
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 15,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    height: 55,
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingRight: 15,
  },
  inputError: {
    borderColor: "#FF0000",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 10,
  },
  loginButton: {
    height: 55,
    backgroundColor: "#0367A6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#0367A6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 20,
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
  },
  signupText: {
    color: "#0367A6",
    fontWeight: "bold",
  },
  eyeIcon: {
    padding: 10,
  },
});

export default LoginScreen;
