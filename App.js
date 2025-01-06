import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Appearance } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import Toast from 'react-native-toast-message';
import { toastConfig } from './Screen/Components/toastConfig';

// Importações de telas
import EntryScreen from './Screen/Entrada/EntryScreen';
import ListScreen from './Screen/CardScreen/ListScreen';
import HomeScreen from './Screen/Menu/HomeScreen';
import AddProductScreen from './Screen/Additem/AddProductScreen';
import BarcodeScannerScreen from './Screen/Additem/BarcodeScannerScreen';
import SettingsScreen from './Screen/Opçoes/SettingsScreen';
import DashboardScreen from './Screen/Dashboard/DashboardScreen';
import ExcelScreen from './Screen/Excel/ExcelScreen';
import LoginScreen from './Screen/Entrada/LoginScreen';
import RegisterScreen from './Screen/Registro/RegisterScreen';
import ProfileScreen from "./Screen/Perfil/ProfileScreen";

const Stack = createStackNavigator();

// Componente StatusBar customizado
const CustomStatusBar = ({ isDarkMode }) => (
  <StatusBar
    translucent
    backgroundColor="transparent"
    animated
    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
    hidden={false} // Define visibilidade conforme necessário
  />
);

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    const updateNavigationBar = async () => {
      await NavigationBar.setBackgroundColorAsync('transparent');
      await NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark');
    };
    updateNavigationBar();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });

    return () => subscription?.remove();
  }, [isDarkMode]);

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <CustomStatusBar isDarkMode={isDarkMode} />
      <Stack.Navigator initialRouteName="EntryScreen">
        <Stack.Screen name="EntryScreen">
          {props => <EntryScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="HomeScreen">
          {props => <HomeScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="ListScreen">
          {props => <ListScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="AddProductScreen">
          {props => <AddProductScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="DashboardScreen">
          {props => <DashboardScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="ExcelScreen">
          {props => <ExcelScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="ProfileScreen">
          {props => <ProfileScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }}>
          {props => <LoginScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="RegisterScreen" options={{ headerShown: false }}>
          {props => <RegisterScreen {...props} isDarkMode={isDarkMode} />}
        </Stack.Screen>
        <Stack.Screen name="BarcodeScannerScreen">
          {props => <BarcodeScannerScreen {...props} />}
        </Stack.Screen>
        <Stack.Screen name="SettingsScreen">
          {props => (
            <SettingsScreen
              {...props}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
