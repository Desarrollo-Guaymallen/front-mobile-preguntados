import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import useQuizActivo from '../../hooks/useQuizActivo';
import useEnviarRespuesta from '../../hooks/useEnviarRespuesta';
import axios from 'axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Preguntas'>;

export interface Pregunta {
  id: number;
  texto: string;
  opciones: {
    id: number;
    texto: string;
    isCorrect: boolean;
  }[];
}

export default function PreguntasScreen({ route, navigation }: Props) {
  const { codigo, participantId } = route.params;

  const { activo, loading: loadingActivo, error } = useQuizActivo(codigo, true);
  const { enviarRespuesta, loading: loadingRespuesta } = useEnviarRespuesta();

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(true);
  const [indexActual, setIndexActual] = useState(0);

  // 👉 Traer preguntas cuando se activa la sesión
  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const res = await axios.post('http://localhost:3000/api/quizzes/getIfActive', {
          code: codigo,
        });

        if (res.data?.questions?.length > 0) {
          const adaptadas = res.data.questions.map((q: any) => ({
            id: q.id,
            texto: q.text,
            opciones: q.options.map((opt: any) => ({
              id: opt.id,
              texto: opt.text,
              isCorrect: opt.isCorrect,
            })),
          }));

          setPreguntas(adaptadas);
        }
      } catch (err) {
        console.error('❌ Error al cargar preguntas:', err);
      } finally {
        setCargandoPreguntas(false);
      }
    };

    if (activo && preguntas.length === 0) {
      fetchPreguntas();
    }
  }, [activo]);

  const handleResponder = async (opcionId: number) => {
    const preguntaActual = preguntas[indexActual];

    console.log('📤 Enviando respuesta:', {
      participantId,
      questionId: preguntaActual.id,
      selectedOptionId: opcionId,
    });

    await enviarRespuesta(participantId, preguntaActual.id, opcionId);
    setIndexActual((prev) => prev + 1);
  };

  if (loadingActivo || cargandoPreguntas) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.title}>⏳ Esperando a que el juego se active . . .</Text> 
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>❌ Error al verificar el estado del quiz</Text>
        <Text style={styles.error}>{error}</Text>
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (activo === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⏳ Esperando a que el juego se active…</Text>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (preguntas.length > 0 && indexActual >= preguntas.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 ¡Has terminado el quiz!</Text>
        <Button title="Volver al inicio" onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  const preguntaActual = preguntas[indexActual];

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
      {loadingRespuesta && <ActivityIndicator style={{ marginTop: 10 }} />}
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
