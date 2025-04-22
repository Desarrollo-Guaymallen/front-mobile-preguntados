import { useState } from 'react';
import axios from 'axios';

export default function useEnviarRespuesta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviarRespuesta = async (
    participantId: number,
    questionId: number,
    selectedOptionId: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Enviando respuesta al backend:', {
        participantId,
        questionId,
        selectedOptionId,
      });
      
      const res = await axios.post('http://192.168.170.75:3000/api/results', {
        participantId,
        questionId,
        selectedOptionId,
      });

      console.log('✅ Respuesta enviada:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ Error al enviar respuesta:', err);
      setError('No se pudo enviar la respuesta');
    } finally {
      setLoading(false);
    }
  };

  return { enviarRespuesta, loading, error };
}
