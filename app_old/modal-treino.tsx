import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/Themed';
import useTreinosStore from '../store/useTreinosStore';

export default function ModalTreinoScreen() {
  const router = useRouter();
  const { fichaId, treinoId } = useLocalSearchParams();
  const { treinos, addTreino, updateTreino } = useTreinosStore();

  const [nome, setNome] = useState('');

  const isEditing = !!treinoId;

  useEffect(() => {
    if (isEditing) {
      const treinoToEdit = treinos.find((t) => t.id.toString() === treinoId);
      if (treinoToEdit) {
        setNome(treinoToEdit.nome || '');
      }
    }
  }, [isEditing, treinoId, treinos]);

  const handleSave = async () => {
    if (nome.trim().length === 0) {
      alert('Por favor, insira o nome do treino.');
      return;
    }

    const treinoData = {
      ficha_id: Number(fichaId),
      nome,
    };

    if (isEditing) {
      await updateTreino({ ...treinoData, id: Number(treinoId) });
    } else {
      await addTreino(treinoData);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditing ? 'Editar Treino' : 'Novo Treino'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do Treino (Ex: Treino A)"
          value={nome}
          onChangeText={setNome}
        />
        <Button title="Salvar Treino" onPress={handleSave} />
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
