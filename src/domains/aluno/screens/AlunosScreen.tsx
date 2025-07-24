import React, { useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import useAlunosStore from '../store/useAlunosStore';
import { resetDatabase as resetDB } from '../../../../utils/databaseUtils';
import globalStyles from '../../../../styles/globalStyles';
import alunosStyles from '../../../../styles/alunosStyles';
import AlunoCard from '../../../../components/AlunoCard';

export default function AlunosScreen() {
  const { alunos, initializeDatabase, deleteAluno } = useAlunosStore();

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  // Debug: Log dos alunos carregados
  useEffect(() => {
    console.log('Alunos carregados:', alunos);
    alunos.forEach(aluno => {
      console.log(`Aluno ${aluno.id}:`, {
        nome: aluno.nome,
        fotoUri: aluno.fotoUri,
        temFoto: !!aluno.fotoUri
      });
    });
  }, [alunos]);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir este aluno? Todos os seus dados serão perdidos.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => deleteAluno(id), style: "destructive" },
      ]
    );
  };

  const handleResetDatabase = () => {
    Alert.alert(
      "Resetar Banco de Dados",
      "Tem certeza que deseja resetar o banco de dados? TODOS os dados serão apagados!",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Resetar", style: "destructive", onPress: resetDB },
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      <Text style={alunosStyles.titulo}>Alunos</Text>
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlunoCard aluno={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<Text style={alunosStyles.semAlunos}>Nenhum aluno cadastrado.</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <TouchableOpacity style={alunosStyles.resetButton} onPress={handleResetDatabase}>
        <Text style={alunosStyles.resetButtonText}>Resetar Banco de Dados</Text>
      </TouchableOpacity>
    </View>
  );
}
