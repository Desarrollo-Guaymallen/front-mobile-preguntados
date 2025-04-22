import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function useQuizActivo(code: string, autoRefresh = false, intervalMs = 3000) {
  const [activo, setActivo] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // referencia para guardar el ID del intervalo y poder cancelarlo
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkActivo = async () => {
      try {
        const res = await axios.post('http://192.168.170.75:3000/api/quizzes/getIfActive', { code });

        if (res.data && res.data.questions) {
          console.log('✅ Estado del quiz: activo');
          setActivo(true);

          // ❗ Si el juego está activo, detenemos el polling
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setActivo(false);
        }

        setError(null);
      } catch (err: any) {
        if (err.response?.status === 204) {
          setActivo(false); // sesión aún no activa
        } else {
          console.error('❌ Error de red o servidor:', err);
          setError('Error al verificar el estado del quiz');
        }
      } finally {
        setLoading(false);
      }
    };

    // primer chequeo inmediato
    checkActivo();

    if (autoRefresh && !intervalRef.current) {
      intervalRef.current = setInterval(() => checkActivo(), intervalMs);
    }

    // limpieza del intervalo si se desmonta el componente
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [code, autoRefresh, intervalMs]);

  return { activo, loading, error };
}
