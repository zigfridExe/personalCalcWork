import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { resetDatabase as resetDB } from '../../utils/databaseUtils';
import { format } from 'date-fns';
import AppStyles from '../../constants/AppStyles';

// Função para formatar telefone
function formatarTelefone(telefone: string) {
  let v = telefone.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) {
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  } else if (v.length > 2) {
    return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    return v;
  }
}

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
    <View style={AppStyles.container}>
      <View style={AppStyles.navbar}>
        <Text style={AppStyles.navbarTitle}>Alunos</Text>
      </View>
      <TouchableOpacity style={AppStyles.button} activeOpacity={0.8}>
        <Link href="/modal" style={AppStyles.buttonText}>Cadastrar Novo Aluno</Link>
      </TouchableOpacity>
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={AppStyles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {item.fotoUri ? (
                <Image source={{ uri: item.fotoUri }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: AppStyles.card.backgroundColor }} />
              ) : (
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: AppStyles.card.backgroundColor }}>
                  <Text style={{ fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#232323' }}>{item.nome.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 10, marginBottom: 10 }}>
                <Text style={AppStyles.title}>{item.nome}</Text>
                {item.data_nascimento && (
                  <Text style={AppStyles.text}>
                    Data de Nascimento: {item.data_nascimento.length === 10 ? item.data_nascimento : format(new Date(item.data_nascimento.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')), 'dd/MM/yyyy')}
                  </Text>
                )}
                {item.contato && <Text style={AppStyles.text}>Telefone: {formatarTelefone(item.contato)}</Text>}
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 4, marginBottom: 2 }}>
              <View style={{ marginHorizontal: 2, flex: 1 }}>
                <Link href={{ pathname: "/aluno/[id]/fichas", params: { id: item.id } }} asChild>
                  <TouchableOpacity style={AppStyles.button}><Text style={AppStyles.buttonText}>Fichas</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={{ marginHorizontal: 2, flex: 1 }}>
                <Link href={`/historico/${item.id}`} asChild>
                  <TouchableOpacity style={AppStyles.button}><Text style={AppStyles.buttonText}>Histórico</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={{ marginHorizontal: 2, flex: 1 }}>
                <Link href={`/edit-aluno/${item.id}`} asChild>
                  <TouchableOpacity style={AppStyles.button}><Text style={AppStyles.buttonText}>Editar</Text></TouchableOpacity>
                </Link>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 4, marginBottom: 2 }}>
              <View style={{ marginHorizontal: 2, flex: 1 }}>
                <Link href={{ pathname: "/aluno/[id]/avaliacao", params: { id: item.id } }} asChild>
                  <TouchableOpacity style={AppStyles.button}><Text style={AppStyles.buttonText}>Avaliação Física</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={{ marginHorizontal: 2, flex: 1 }}>
                <Link href={{ pathname: "/aluno/[id]/horarios", params: { id: item.id } }} asChild>
                  <TouchableOpacity style={AppStyles.button}><Text style={AppStyles.buttonText}>Aulas</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={{ marginHorizontal: 2, flex: 1 }}>
                <TouchableOpacity style={[AppStyles.button, { backgroundColor: 'red' }]} onPress={() => handleDelete(item.id)}>
                  <Text style={[AppStyles.buttonText, { color: '#fff' }]}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        style={{ width: '100%', marginTop: 0 }}
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
