import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from 'react-native';
import useFichasStore from '../store/useFichasStore';
import useAlunosStore from '../store/useAlunosStore';
import { theme } from '@/styles/theme';

export default function ModalCopiarFichaScreen() {
  const router = useRouter();
  const { fichaId } = useLocalSearchParams();
  const { fichas, copyFicha } = useFichasStore();
  const { alunos, initializeDatabase } = useAlunosStore();

  const [novoNome, setNovoNome] = useState('');
  const [alunoDestino, setAlunoDestino] = useState<number | null>(null);
  const [fichaOriginal, setFichaOriginal] = useState<any>(null);

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
    };
    initDB();
  }, [initializeDatabase]);

  useEffect(() => {
    if (fichaId) {
      const ficha = fichas.find(f => f.id.toString() === fichaId);
      if (ficha) {
        setFichaOriginal(ficha);
        setNovoNome(`${ficha.nome} (Cópia)`);
      }
    }
  }, [fichaId, fichas]);

  const handleCopiar = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a nova ficha.');
      return;
    }

    if (!alunoDestino) {
      Alert.alert('Erro', 'Por favor, selecione um aluno de destino.');
      return;
    }

    try {
      await copyFicha(Number(fichaId), alunoDestino, novoNome);
      Alert.alert(
        'Sucesso',
        'Ficha copiada com sucesso!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao copiar ficha: ' + error);
    }
  };

  const handleCopiarMesmoAluno = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a nova ficha.');
      return;
    }

    try {
      await copyFicha(Number(fichaId), undefined, novoNome);
      Alert.alert(
        'Sucesso',
        'Ficha copiada com sucesso!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Erro ao copiar ficha: ' + error);
    }
  };

  if (!fichaOriginal) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Copiar Ficha</Text>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Ficha Original</Text>
          <Text style={styles.fichaNome}>{fichaOriginal.nome}</Text>
          {fichaOriginal.objetivos && (
            <Text style={styles.fichaDetail}>Objetivos: {fichaOriginal.objetivos}</Text>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Nome da Nova Ficha</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da nova ficha"
            placeholderTextColor={theme.colors.textSecondary}
            value={novoNome}
            onChangeText={setNovoNome}
          />

          <Text style={styles.label}>Aluno de Destino</Text>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => {
              const alunoSelecionado = alunos.find(a => a.id === alunoDestino);
              const opcoes = alunos.map(aluno => ({
                text: aluno.nome,
                onPress: () => setAlunoDestino(aluno.id)
              }));

              Alert.alert(
                'Selecionar Aluno',
                'Escolha o aluno de destino:',
                [
                  ...opcoes,
                  { text: 'Cancelar', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={[
              styles.pickerText,
              !alunoDestino && { color: theme.colors.textSecondary }
            ]}>
              {alunoDestino ? alunos.find(a => a.id === alunoDestino)?.nome : 'Selecione um aluno...'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCopiar}
          >
            <Text style={styles.buttonTextPrimary}>📋 Copiar para Outro Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCopiarMesmoAluno}
          >
            <Text style={styles.buttonTextSecondary}>📄 Copiar para Mesmo Aluno</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonTextCancel}>❌ Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
  infoSection: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  fichaNome: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 5,
  },
  fichaDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.secondary,
  },
  formSection: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
    color: theme.colors.primary,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  pickerContainer: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    marginBottom: 20,
    height: 48,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    paddingHorizontal: 12,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  actionsContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonTextCancel: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
}); 