import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/styles/Themed';
import useFichasStore from '../store/useFichasStore';
import useAlunosStore from '../store/useAlunosStore';

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
            <Text style={styles.pickerText}>
              {alunoDestino ? alunos.find(a => a.id === alunoDestino)?.nome : 'Selecione um aluno...'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <Button 
            title="📋 Copiar para Outro Aluno" 
            onPress={handleCopiar} 
            color="#2196F3"
          />
          <Button 
            title="📄 Copiar para Mesmo Aluno" 
            onPress={handleCopiarMesmoAluno} 
            color="#4CAF50"
          />
          <Button 
            title="❌ Cancelar" 
            onPress={() => router.back()} 
            color="#f44336"
          />
        </View>
      </ScrollView>
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
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  fichaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 5,
  },
  fichaDetail: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  picker: {
    height: 45,
    width: '100%',
  },
  pickerText: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#333',
  },
  actionsContainer: {
    width: '100%',
    gap: 15,
  },
}); 