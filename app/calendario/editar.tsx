import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';

export default function EditarAulaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { aulas, editarAula } = useAulasStore();
  const aula = aulas.find(a => a.id === Number(id));

  const [data, setData] = useState(aula?.data || '');
  const [hora, setHora] = useState(aula?.hora || '');
  const [descricao, setDescricao] = useState(aula?.descricao || '');
  const [presenca, setPresenca] = useState(aula?.presenca || false);

  useEffect(() => {
    if (aula) {
      setData(aula.data);
      setHora(aula.hora);
      setDescricao(aula.descricao);
      setPresenca(aula.presenca);
    }
  }, [aula]);

  const handleSalvar = async () => {
    if (!data || !hora || !descricao) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    await editarAula({ id: Number(id), data, hora, descricao, presenca });
    Alert.alert('Aula editada com sucesso!');
    router.back();
  };

  if (!aula) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aula não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Aula</Text>
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
      <Button title="Salvar" onPress={handleSalvar} color="#2196F3" />
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