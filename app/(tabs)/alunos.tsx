import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { resetDatabase as resetDB } from '../../utils/databaseUtils';
import { format } from 'date-fns';

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
    <View style={styles.container}>
      {/* <Text style={styles.title}>Alunos</Text> */}
      <TouchableOpacity style={styles.cadastrarButton} activeOpacity={0.8} onPress={() => { /* navegação */ }}>
        <Link href="/modal" style={styles.cadastrarButtonText}>Cadastrar Novo Aluno</Link>
      </TouchableOpacity>
      {/* <Button title="🔧 Resetar Banco (Debug)" onPress={handleResetDatabase} color="orange" /> */}
      {/* <Button title="🐛 Debug Fotos" onPress={debugAlunos} color="purple" /> */}
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.alunoContainer}>
            <View style={styles.infoRow}>
              {item.fotoUri ? (
                <Image source={{ uri: item.fotoUri }} style={styles.alunoImage} />
              ) : (
                <View style={styles.alunoImagePlaceholder}>
                  <Text style={styles.alunoImagePlaceholderText}>
                    {item.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.alunoInfo}>
                <Text style={styles.alunoItem}>{item.nome}</Text>
                {item.data_nascimento && (
                  <Text style={styles.alunoDetail}>
                    Data de Nascimento: {item.data_nascimento.length === 10 ? item.data_nascimento : format(new Date(item.data_nascimento.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')), 'dd/MM/yyyy')}
                  </Text>
                )}
                {item.contato && <Text style={styles.alunoDetail}>Telefone: {item.contato}</Text>}
              </View>
            </View>
            <View style={styles.buttonsRow}>
              <View style={styles.buttonWrapper}>
                <Link href={{ pathname: "/aluno/[id]/fichas", params: { id: item.id } }} asChild>
                  <Button title="Fichas" />
                </Link>
              </View>
              <View style={styles.buttonWrapper}>
                <Link href={`/historico/${item.id}`} asChild>
                  <Button title="Histórico" color="#4CAF50" />
                </Link>
              </View>
              <View style={styles.buttonWrapper}>
                <Link href={`/edit-aluno/${item.id}`} asChild>
                  <Button title="Editar" />
                </Link>
              </View>
            </View>
            <View style={styles.buttonsRow}>
              <View style={styles.buttonWrapper}>
                <Link href={{ pathname: "/aluno/[id]/avaliacao", params: { id: item.id } }} asChild>
                  <Button title="Avaliação Física" color="#2196F3" />
                </Link>
              </View>
              <View style={styles.buttonWrapper}>
                <Link href={{ pathname: "/aluno/[id]/horarios-padrao", params: { id: item.id } }} asChild>
                  <Button title="📅 Horários" color="#FF9800" />
                </Link>
              </View>
              <View style={styles.buttonWrapper}>
                <Button title="Excluir" onPress={() => handleDelete(item.id)} color="red" />
              </View>
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
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alunoInfo: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 10, // Espaço extra abaixo dos dados do aluno
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
  alunoImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alunoImagePlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 5,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: 'blue',
  },
  cadastrarButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cadastrarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 2,
  },
  buttonWrapper: {
    marginHorizontal: 2,
    flex: 1,
  },
});
