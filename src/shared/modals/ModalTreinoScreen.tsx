import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text } from 'react-native';
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
