import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';

export default function NovaAulaScreen() {
  const router = useRouter();
  const { adicionarAula } = useAulasStore();
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [presenca, setPresenca] = useState(false);

  const handleSalvar = async () => {
    if (!data || !hora || !descricao) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    await adicionarAula({ data, hora, descricao, presenca });
    Alert.alert('Aula adicionada com sucesso!');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Nova Aula</Text>
      <TextInput
        style={styles.input}
        placeholder="Data (AAAA-MM-DD)"
        value={data}
        onChangeText={setData}
      />
      <TextInput
        style={styles.input}
        placeholder="Hora (HH:MM)"
        value={hora}
        onChangeText={setHora}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição da Aula"
        value={descricao}
        onChangeText={setDescricao}
      />
      <View style={styles.switchRow}>
        <Text>Presença:</Text>
        <Switch value={presenca} onValueChange={setPresenca} />
      </View>
      <Button title="Salvar" onPress={handleSalvar} color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
}); 