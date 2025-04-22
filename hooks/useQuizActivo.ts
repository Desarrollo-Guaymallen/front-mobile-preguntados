import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function useQuizActivo(code: string, autoRefresh = false, intervalMs = 3000) {
  const [activo, setActivo] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkActivo = async () => {
      try {
        const res = await axios.post('http://localhost:3000/api/quizzes/getIfActive', { code });

        if (res.status === 204) {
          console.log('⏳ Sesión inactiva (204)');
          setActivo(false);
          return;
        }

        if (res.data?.questions) {
          console.log('✅ Sesión activa');
          setActivo(true);

          // Detenemos el polling si está activa
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err: any) {
        console.error('❌ Error al verificar el estado del quiz:', err);
        setError('Error al verificar el estado del quiz');
      } finally {
        setLoading(false);
      }
    };

    checkActivo();

    if (autoRefresh && !intervalRef.current) {
      intervalRef.current = setInterval(() => checkActivo(), intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [code, autoRefresh, intervalMs]);

  return { activo, loading, error };
}
