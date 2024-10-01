import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import EntryScreen from './Screen/Entrada/EntryScreen';
import ListScreen from './Screen/CardScreen/ListScreen';
import HomeScreen from './Screen/Menu/HomeScreen';
import AddProductScreen from './Screen/Additem/AddProductScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EntryScreen">
        <Stack.Screen name="EntryScreen" component={EntryScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ListScreen" component={ListScreen}/>
        <Stack.Screen name="AddProductScreen" component={AddProductScreen}/>
      </Stack.Navigator>
    
    </NavigationContainer>
  );
}
