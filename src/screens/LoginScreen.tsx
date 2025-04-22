import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import axios from 'axios';

const { height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [animando, setAnimando] = useState(false);

  const logoScale = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      logoScale.setValue(1);
      logoOpacity.setValue(1);
      logoTranslateY.setValue(0);
      setAnimando(false);
    }, [])
  );

  const handleIngresar = async () => {
    if (!codigo || !nombre) {
      Alert.alert('Completa todos los campos');
      return;
    }

    setAnimando(true);

    try {
      const res = await axios.post('http://192.168.170.75:3000/api/sessions/join', {
        code: codigo,
        name: nombre,
      });

      const participantId = res.data.participant.id;
      console.log('🔗 Usuario unido, ID:', participantId);

      Animated.sequence([
        Animated.timing(logoTranslateY, {
          toValue: height / 2 - 150,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        navigation.navigate('Preguntas', { codigo, participantId });
      });
    } catch (err) {
      console.error('❌ Error al ingresar:', err);
      Alert.alert('Error al unirse', 'Verifica el código e intenta nuevamente.');
      setAnimando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/logo2.png')}
        style={[
          styles.logo,
          {
            transform: [
              { translateY: logoTranslateY },
              { scale: logoScale },
            ],
            opacity: logoOpacity,
            position: animando ? 'absolute' : 'relative',
            alignSelf: 'center',
            top: animando ? 0 : undefined,
          },
        ]}
      />

      {!animando && (
        <>
          <Text style={styles.title}>Guaymallén Pregunta</Text>

          <TextInput
            placeholder="Código de acceso"
            style={styles.input}
            value={codigo}
            onChangeText={setCodigo}
          />
          <TextInput
            placeholder="Tu nombre"
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
          />

          <Button title="INGRESAR" onPress={handleIngresar} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a1b9a',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Nunito_700Bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'Nunito_400Regular',
  },
});
