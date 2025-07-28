import React, { useEffect } from 'react';
import { View, FlatList, Alert, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import useAlunosStore from '../../store/useAlunosStore';
import { resetDatabase as resetDB } from '../../utils/databaseUtils';
import AlunoCard from '../../components/AlunoCard';
import alunosStyles from '@/styles/alunos.styles';

export default function AlunosScreen() {
  const { alunos, initializeDatabase, deleteAluno, debugAlunos } = useAlunosStore();

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
    <View style={alunosStyles.container}>
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
        contentContainerStyle={alunosStyles.contentContainer}
        ListEmptyComponent={
          <View style={{
            alignItems: 'center',
            marginTop: 40,
            padding: 20,
          }}>
            <MaterialIcons name="person-off" size={64} color="#555" />
            <Text style={alunosStyles.emptyMessage}>
              Nenhum aluno cadastrado ainda.{'\n'}
              Clique no botão abaixo para começar.
            </Text>
          </View>
        }
      />
      
      <Link href="/modal" asChild>
        <TouchableOpacity style={alunosStyles.cadastrarButton}>
          <MaterialIcons name="person-add" size={24} color="#000" style={{ marginRight: 8 }} />
          <Text style={alunosStyles.cadastrarButtonText}>Cadastrar Novo Aluno</Text>
        </TouchableOpacity>
      </Link>
      
      {/* Botão de debug - remover em produção */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={handleResetDatabase}
      >
        <MaterialIcons name="bug-report" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

// Estilos locais (apenas para debug)
const styles = StyleSheet.create({
  debugButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F44336',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
