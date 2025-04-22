import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import usePreguntas from '../../hooks/usePregunta';
import useQuizActivo from '../../hooks/useQuizActivo';
import useEnviarRespuesta from '../../hooks/useEnviarRespuesta';

type Props = NativeStackScreenProps<RootStackParamList, 'Preguntas'>;

export default function PreguntasScreen({ route, navigation }: Props) {
  const { codigo, participantId } = route.params;

  const { activo, loading: loadingActivo, error } = useQuizActivo(codigo, true);
  const { preguntas, loading: loadingPreguntas } = usePreguntas(codigo);
  const { enviarRespuesta, loading: loadingRespuesta } = useEnviarRespuesta();

  const [indexActual, setIndexActual] = useState(0);

  const preguntaActual = preguntas[indexActual];

  const handleResponder = async (opcionId: number) => {
    console.log('🔽 Enviando respuesta con:', {
      participantId,
      questionId: preguntaActual.id,
      selectedOptionId: opcionId,
    });

    await enviarRespuesta(participantId, preguntaActual.id, opcionId);
    setIndexActual((prev) => prev + 1);
  };

  if (loadingActivo || loadingPreguntas) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error al verificar el estado del quiz</Text>
        <Text style={styles.error}>{error}</Text>
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!activo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⏳ Esperando a que el juego se active...</Text>
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (indexActual >= preguntas.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 ¡Has terminado el quiz!</Text>
        <Button title="Volver al inicio" onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{preguntaActual.texto}</Text>
      <FlatList
        data={preguntaActual.opciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleResponder(item.id)}
            disabled={loadingRespuesta}
          >
            <Text style={styles.optionText}>{item.texto}</Text>
          </TouchableOpacity>
        )}
      />
      {loadingRespuesta && <ActivityIndicator style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  option: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
