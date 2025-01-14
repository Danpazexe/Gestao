// LoginScreen.js
import React, { useState, useEffect } from "react";
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
  Dimensions,
  Animated,
  Keyboard,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  // Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  // Animações
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const shakeAnimation = new Animated.Value(0);

  // Verificar suporte biométrico
  useEffect(() => {
    checkBiometricSupport();
    loadSavedCredentials();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      // Só habilita se o dispositivo for compatível E tiver biometria cadastrada
      setBiometricSupported(compatible && enrolled);
      
      // Verificar se já existe login salvo para habilitar biometria
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      
      if (savedEmail && savedPassword) {
        // Tenta autenticação biométrica automaticamente
        handleBiometricAuth();
      }
    } catch (error) {
      console.error('Erro ao verificar suporte biométrico:', error);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      
      if (savedEmail && savedRememberMe === 'true') {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login com biometria',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar senha',
      });

      if (result.success) {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        
        if (savedEmail && savedPassword) {
          // Login automático com credenciais salvas
          handleLogin(savedEmail, savedPassword);
        } else {
          Toast.show({
            type: 'info',
            text1: 'Configuração Necessária',
            text2: 'Faça login primeiro para usar a biometria',
          });
        }
      } else {
        // Usuário cancelou ou falhou
        Toast.show({
          type: 'info',
          text1: 'Autenticação Cancelada',
          text2: 'Use seu email e senha para entrar',
        });
      }
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível usar a biometria',
      });
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
        
        // Verificar se pode habilitar biometria
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (compatible && enrolled) {
          Alert.alert(
            'Biometria',
            'Deseja habilitar o login com impressão digital?',
            [
              {
                text: 'Não',
                style: 'cancel'
              },
              {
                text: 'Sim',
                onPress: async () => {
                  await AsyncStorage.setItem('biometricEnabled', 'true');
                  setBiometricSupported(true);
                }
              }
            ]
          );
        }
      } else {
        await AsyncStorage.multiRemove(['savedEmail', 'savedPassword', 'rememberMe', 'biometricEnabled']);
      }
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  };

  const handleLogin = async (customEmail = email, customPassword = password) => {
    Keyboard.dismiss();
    
    if (!validateFields(customEmail, customPassword)) return;

    setIsLoading(true);

    try {
      // Login fixo para admin
      if (customEmail.trim().toLowerCase() === "admin@gmail.com" && customPassword === "123456") {
        await handleSuccessfulLogin();
        return;
      }

      // Tentativa de login com API
      const response = await axios.post(
        "https://api.gestao.aviait.com.br/sessions",
        {
          email: customEmail.trim(),
          password: customPassword.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        await handleSuccessfulLogin();
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateFields = (email, password) => {
    if (!email.trim() || !validateEmail(email.trim())) {
      setEmailError("Email inválido");
      return false;
    }
    if (!password.trim() || password.length < 6) {
      setPasswordError("Senha deve ter no mínimo 6 caracteres");
      return false;
    }
    return true;
  };

  const handleSuccessfulLogin = async () => {
    await saveCredentials();
    Toast.show({
      type: 'success',
      text1: 'Bem-vindo!',
      text2: 'Login realizado com sucesso',
    });
    navigation.navigate("HomeScreen");
  };

  const handleLoginError = (error) => {
    shakeForm();
    setLoginAttempts(prev => prev + 1);
    
    if (loginAttempts >= 2) { // Bloqueia após 3 tentativas
      setIsBlocked(true);
      setBlockTimer(30); // 30 segundos de bloqueio
      
      const interval = setInterval(() => {
        setBlockTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsBlocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      Toast.show({
        type: 'error',
        text1: 'Login Bloqueado',
        text2: `Tente novamente em ${blockTimer} segundos`,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro no Login',
        text2: `Tentativa ${loginAttempts + 1} de 3`,
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <ImageBackground
      source={require('../../assets/Image/FUNDOAPP.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.topSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Image
            source={require("../../assets/Image/LOGOCOMFRASE.png")}
            style={styles.icon}
          />
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.formBox,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnimation }
                ]
              }
            ]}
          >
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, emailError && styles.inputError]}>
                <Icon name="email" size={20} color="#0367A6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, passwordError && styles.inputError]}>
                <Icon name="lock" size={20} color="#0367A6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
                  secureTextEntry={secureText}
                />
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
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {isBlocked && (
              <View style={styles.blockedContainer}>
                <Icon name="lock-clock" size={24} color="#FF6B6B" />
                <Text style={styles.blockedText}>
                  Tente novamente em {blockTimer}s
                </Text>
              </View>
            )}

            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Icon
                  name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={24}
                  color="#0367A6"
                />
                <Text style={styles.checkboxText}>Lembrar-me</Text>
              </TouchableOpacity>

              {biometricSupported && (
                <TouchableOpacity 
                  style={styles.biometricButton}
                  onPress={handleBiometricAuth}
                >
                  <Icon name="fingerprint" size={24} color="#0367A6" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isBlocked && styles.loginButtonDisabled
              ]}
              onPress={() => handleLogin()}
              disabled={isLoading || isBlocked}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {isBlocked ? `Bloqueado (${blockTimer}s)` : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

          </Animated.View>
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0367A6',
  },
  checkboxText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  biometricButton: {
    padding: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0367A6',
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
  eyeIcon: {
    padding: 10,
  },
  blockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFE8E8',
    borderRadius: 8,
  },
  blockedText: {
    marginLeft: 8,
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0.1,
  },
});

export default LoginScreen;
