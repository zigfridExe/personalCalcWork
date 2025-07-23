import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text } from 'react-native';
import useFichasStore from '../store/useFichasStore';

export default function ModalFichaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { alunoId, fichaId } = (route as any).params || {};
  const { fichas, addFicha, updateFicha } = useFichasStore();

  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [professor, setProfessor] = useState('');
  const [descansoPadrao, setDescansoPadrao] = useState('');

  const isEditing = !!fichaId;

  useEffect(() => {
    if (isEditing) {
      const fichaToEdit = fichas.find((f) => f.id.toString() === fichaId);
      if (fichaToEdit) {
        setNome(fichaToEdit.nome || '');
        setDataInicio(fichaToEdit.data_inicio || '');
        setDataFim(fichaToEdit.data_fim || '');
        setObjetivos(fichaToEdit.objetivos || '');
        setObservacoes(fichaToEdit.observacoes || '');
        setProfessor(fichaToEdit.professor || '');
        setDescansoPadrao(fichaToEdit.descanso_padrao || '');
      }
    }
  }, [isEditing, fichaId, fichas]);

  const handleSave = async () => {
    if (nome.trim().length === 0) {
      alert('Por favor, insira o nome da ficha.');
      return;
    }

    const fichaData = {
      aluno_id: Number(alunoId),
      nome,
      data_inicio: dataInicio,
      data_fim: dataFim,
      objetivos,
      observacoes,
      professor,
      descanso_padrao: descansoPadrao,
    };

    if (isEditing) {
      await updateFicha({ ...fichaData, id: Number(fichaId) });
    } else {
      await addFicha(fichaData);
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
