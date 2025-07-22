import React, { useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { resetDatabase as resetDB } from '../../utils/databaseUtils';
import globalStyles from '../../styles/globalStyles';
import alunosStyles from '../../styles/alunosStyles';
import AlunoCard from '../../components/AlunoCard';

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
      "ATENÇÃO: Isso irá apagar TODOS os dados do aplicativo. Tem certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Resetar", 
          onPress: async () => {
            try {
              await resetDB();
              await initializeDatabase();
              Alert.alert("Sucesso", "Banco de dados resetado com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Erro ao resetar banco de dados: " + error);
            }
          }, 
          style: "destructive" 
        },
      ]
    );
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.navbar}>
        <Text style={globalStyles.navbarTitle}>Alunos</Text>
      </View>
      <TouchableOpacity style={globalStyles.button} activeOpacity={0.8}>
        <Link href="/modal" style={globalStyles.buttonText}>Cadastrar Novo Aluno</Link>
      </TouchableOpacity>
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlunoCard 
            aluno={item} 
            onDelete={handleDelete} 
          />
        )}
        style={alunosStyles.list}
      />
    </View>
  );
}


