import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from 'react-native';
import useTreinosStore from '../store/useTreinosStore';
import { theme } from '@/styles/theme';

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
          placeholderTextColor={theme.colors.textSecondary}
          value={nome}
          onChangeText={setNome}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar Treino</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 20,
    fontWeight: 'normal',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  saveButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    fontSize: 18,
    textTransform: 'uppercase',
  },
});
