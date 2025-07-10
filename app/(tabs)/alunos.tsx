import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, Image } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { resetDatabase as resetDB } from '../../utils/databaseUtils';

export default function AlunosScreen() {
  const { alunos, initializeDatabase, deleteAluno } = useAlunosStore();

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

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
    <View style={styles.container}>
      <Text style={styles.title}>Alunos</Text>
      <Link href="/modal" style={styles.link}>Cadastrar Novo Aluno</Link>
      <Button title="🔧 Resetar Banco (Debug)" onPress={handleResetDatabase} color="orange" />
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.alunoContainer}>
            {item.fotoUri && <Image source={{ uri: item.fotoUri }} style={styles.alunoImage} />}
            <View style={styles.alunoInfo}>
              <Text style={styles.alunoItem}>{item.nome}</Text>
              {item.status && <Text style={styles.alunoDetail}>Status: {item.status}</Text>}
              {item.contato && <Text style={styles.alunoDetail}>Contato: {item.contato}</Text>}
            </View>
            <View style={styles.buttonsContainer}>
              <Link href={{ pathname: "/aluno/[id]/fichas", params: { id: item.id } }} asChild>
                <Button title="Ver Fichas" />
              </Link>
              <Link href={`/edit-aluno/${item.id}`} asChild>
                <Button title="Editar" />
              </Link>
              <Button title="Excluir" onPress={() => handleDelete(item.id)} color="red" />
            </View>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    width: '100%',
    marginTop: 20,
  },
  alunoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  alunoInfo: {
    flex: 1,
    marginLeft: 10,
  },
  alunoItem: {
    fontSize: 18,
  },
  alunoDetail: {
    fontSize: 14,
    color: 'gray',
  },
  alunoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 5, // Adiciona um pequeno espaço entre os botões
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: 'blue',
  },
});
