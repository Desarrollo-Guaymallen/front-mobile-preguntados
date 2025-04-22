import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import useQuizActivo from '../../hooks/useQuizActivo'; // asumiendo que lo guardaste ahí

export default function CheckQuizScreen() {
  const [code, setCode] = useState('');
  const [check, setCheck] = useState(false);

  const { activo, loading, error } = useQuizActivo(check ? code : '');

  const handleVerificar = () => {
    if (code.trim()) {
      setCheck(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificar código de juego</Text>

      <TextInput
        placeholder="Código"
        style={styles.input}
        value={code}
        onChangeText={setCode}
      />

      <Button title="Verificar" onPress={handleVerificar} />

      {loading && check && <ActivityIndicator style={{ marginTop: 20 }} />}

      {!loading && check && activo !== null && (
        <Text style={styles.resultado}>
          {activo ? '✅ El juego está activo' : '⛔ El juego NO está activo'}
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f3e5f5',
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#4a148c',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  resultado: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#2e7d32',
  },
  error: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
});
