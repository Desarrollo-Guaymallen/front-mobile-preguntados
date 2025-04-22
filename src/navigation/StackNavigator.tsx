import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import PreguntasScreen from '../screens/PreguntasScreen';
import { RootStackParamList } from './types'; // importa los tipos
import CheckQuizScreen from '../screens/CheckQuizScreen';

// PASÁ LOS TIPOS AL STACK
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    
    <Stack.Navigator initialRouteName="Login" id={undefined} >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Preguntas" component={PreguntasScreen} />
      <Stack.Screen name="Questionario" component={CheckQuizScreen} />
    </Stack.Navigator>
  );
}
