import { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config/config';

export interface Pregunta {
  id: number;
  texto: string;
  opciones: {
    id: number;
    texto: string;
    isCorrect: boolean;
  }[];
}

export default function usePreguntas(code: string) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const res = await axios.post(`${config.apiUrl}/quizzes/getIfActive`, { code });

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
        } else {
          setPreguntas([]);
        }
      } catch (err) {
        console.error('❌ Error al obtener preguntas:', err);
        setError('No se pudieron cargar las preguntas');
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, [code]);

  return { preguntas, loading, error };
}
