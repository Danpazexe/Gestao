import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

import EntryScreen from './Screen/Entrada/EntryScreen';
import ListScreen from './Screen/CardScreen/ListScreen';
import HomeScreen from './Screen/Menu/HomeScreen';
import AddProductScreen from './Screen/Additem/AddProductScreen';
import BarcodeScannerScreen from './Screen/Additem/BarcodeScannerScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const configureNavigationBar = async () => {
        const colorScheme = Appearance.getColorScheme(); // Detecta o tema atual (light ou dark)

        // Torna a barra de navegação transparente
        await NavigationBar.setBackgroundColorAsync('transparent');

        // Define o estilo dos botões da barra de navegação
        if (colorScheme === 'dark') {
            await NavigationBar.setButtonStyleAsync('light'); // Para ícones e texto claros em fundo escuro
        } else {
            await NavigationBar.setButtonStyleAsync('dark'); // Para ícones e texto escuros em fundo claro
        }
    };

    configureNavigationBar();
}, []);
  return (
    <NavigationContainer>

      {/* Configuração da StatusBar para todo o aplicativo */}
      <StatusBar style="auto" />



      <Stack.Navigator initialRouteName="EntryScreen">
        <Stack.Screen name="EntryScreen" component={EntryScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ListScreen" component={ListScreen} />
        <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
        <Stack.Screen name="BarcodeScannerScreen" component={BarcodeScannerScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
