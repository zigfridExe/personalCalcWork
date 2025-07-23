import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text } from 'react-native';
import useFichasStore from '../store/useFichasStore';
import useAlunosStore from '../store/useAlunosStore';

export default function ModalCopiarFichaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { fichaId } = (route as any).params || {};
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
    // ...
  };

  return (
    <View style={styles.container}>
      {/* ...UI do modal... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // ...
  },
});
