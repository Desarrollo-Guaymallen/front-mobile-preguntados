import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import useQuizActivo from '../../hooks/useQuizActivo';
import useEnviarRespuesta from '../../hooks/useEnviarRespuesta';
import axios from 'axios';
import config from '../../config/config';


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

  const [esperando, setEsperando] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  


  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const res = await axios.post(`${config.apiUrl}/quizzes/getIfActive`, { code: codigo });

        if (!res.data?.questions || res.data.questions.length === 0) {
          throw new Error('No hay preguntas disponibles');
        }

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
      } catch (err) {
        console.error('❌ Error al obtener preguntas:', err);
      } finally {
        setCargandoPreguntas(false);
      }
    };

    if (activo && preguntas.length === 0) {
      fetchPreguntas();
    }
  }, [activo]);

  useEffect(() => {
    if (preguntas.length === 0 || indexActual >= preguntas.length) return;
  
   // setEsperando(true);
    setOpcionSeleccionada(null);
  
    const timeout = setTimeout(() => {
      setIndexActual((prev) => prev + 1);
      setEsperando(false);
      setOpcionSeleccionada(null);
    }, 15000);
  
    return () => clearTimeout(timeout);
  }, [indexActual, preguntas.length]);
  

  const handleResponder = async (opcionId: number) => {
    if (opcionSeleccionada !== null) return; // solo una vez
  
    setOpcionSeleccionada(opcionId);
  
    const preguntaActual = preguntas[indexActual];
    await enviarRespuesta(participantId, preguntaActual.id, opcionId);
  };
  
  
  const preguntaActual = preguntas[indexActual];

  function esBase64Imagen(texto: string): boolean {
    return texto.startsWith('data:image/') || (texto.length > 100 && !/\s/.test(texto));
  }

  function OpcionVisual({ contenido }: { contenido: string }) {
    const uri = contenido.startsWith('data:image/') ? contenido : `data:image/jpeg;base64,${contenido}`;
    if (esBase64Imagen(contenido)) {
      return <Image source={{ uri }} style={styles.imagen} resizeMode="cover" />;
    }
    return <Text style={styles.optionText}>{contenido}</Text>;
  }

  if (loadingActivo || cargandoPreguntas) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff4081" />
        <Text style={styles.title}>🔄 Verificando estado del juego...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>❌ Error al verificar el estado del juego</Text>
        <Text style={styles.subtitle}>{error}</Text>
      </View>
    );
  }

  if (activo === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⏳ Esperando a que el juego se active…</Text>
        <ActivityIndicator color="#ff4081" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (preguntas.length > 0 && indexActual >= preguntas.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 ¡Has terminado el quiz!</Text>
      </View>
    );
  }

  if (!preguntaActual) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⏳ Cargando pregunta...</Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  

  return (
    <View style={styles.container}>
      <View style={styles.quizCard}>
        <Text style={styles.questionTitle}>{preguntaActual.texto}</Text>

        <FlatList
          data={preguntaActual.opciones}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.optionRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionCard,
                opcionSeleccionada === item.id && styles.optionSeleccionada, // aplicar estilo si está seleccionada
              ]}
              onPress={() => handleResponder(item.id)}
              disabled={esperando || opcionSeleccionada !== null}
            >
              <OpcionVisual contenido={item.texto} />
            </TouchableOpacity>

          )}
        />

        {loadingRespuesta && <ActivityIndicator color="#4caf50" style={{ marginTop: 20 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a11cb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'Nunito_700Bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#ffdede',
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
    marginBottom: 10,
  },
  quizCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  questionTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#ffeb3b',
    fontFamily: 'Nunito_700Bold',
    marginBottom: 20,
  },
  optionRow: {
    justifyContent: 'space-between',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 15,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
  },
  imagen: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  optionSeleccionada: {
    backgroundColor: '#BBDEFB', // azul claro, buena visibilidad
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  
  
});
