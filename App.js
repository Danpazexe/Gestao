import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Appearance } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

// Importações de telas
import EntryScreen from './Screen/Entrada/EntryScreen';
import ListScreen from './Screen/CardScreen/ListScreen';
import HomeScreen from './Screen/Menu/HomeScreen';
import AddProductScreen from './Screen/Additem/AddProductScreen';
import BarcodeScannerScreen from './Screen/Additem/BarcodeScannerScreen';
import SettingsScreen from './Screen/Opçoes/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado global para tema
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const configureNavigationBar = async () => {
      // Torna a barra de navegação transparente
      await NavigationBar.setBackgroundColorAsync('transparent');

      // Define o estilo dos botões da barra de navegação
      if (colorScheme === 'dark') {
        await NavigationBar.setButtonStyleAsync('light');
      } else {
        await NavigationBar.setButtonStyleAsync('dark');
      }
    };

    configureNavigationBar();
    
    // Listener para mudanças no tema do dispositivo
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
      setIsDarkMode(colorScheme === 'dark');
    });

    return () => subscription?.remove(); // Remove listener ao desmontar componente
  }, [colorScheme]);

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
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
        <Stack.Screen name="BarcodeScannerScreen" component={BarcodeScannerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SettingsScreen">
          {props => <SettingsScreen {...props} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} 
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
