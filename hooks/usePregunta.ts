import { useEffect, useState } from 'react';
import axios from 'axios';

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
        const res = await axios.post('http://localhost:3000/api/quizzes/getIfActive', { code });

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
