import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import EntryScreen from './src/screen/EntryScreen';
import ListScreen from './src/screen/ListScreen';
import HomeScreen from './src/screen/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EntryScreen">
        <Stack.Screen name="EntryScreen" component={EntryScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ListScreen" component={ListScreen}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
