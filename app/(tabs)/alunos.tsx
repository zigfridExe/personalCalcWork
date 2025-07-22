import React, { useEffect } from 'react';
import { View, Text, FlatList, Alert, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { resetDatabase as resetDB } from '../../utils/databaseUtils';
import { format } from 'date-fns';
import globalStyles from '../../styles/globalStyles';
import alunosStyles from '../../styles/alunosStyles';

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
          <View style={globalStyles.card}>
            <View style={alunosStyles.cardContent}>
              {item.fotoUri ? (
                <Image source={{ uri: item.fotoUri }} style={alunosStyles.profileImage} />
              ) : (
                <View style={alunosStyles.profileInitialContainer}>
                  <Text style={alunosStyles.profileInitialText}>{item.nome.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={alunosStyles.infoContainer}>
                <Text style={globalStyles.title}>{item.nome}</Text>
                {item.data_nascimento && (
                  <Text style={globalStyles.text}>
                    Data de Nascimento: {item.data_nascimento.length === 10 ? item.data_nascimento : format(new Date(item.data_nascimento.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')), 'dd/MM/yyyy')}
                  </Text>
                )}
                {item.contato && <Text style={globalStyles.text}>Telefone: {formatarTelefone(item.contato)}</Text>}
              </View>
            </View>
            <View style={alunosStyles.buttonContainer}>
              <View style={alunosStyles.buttonWrapper}>
                <Link href={{ pathname: "/aluno/[id]/fichas", params: { id: item.id } }} asChild>
                  <TouchableOpacity style={globalStyles.button}><Text style={globalStyles.buttonText}>Fichas</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={alunosStyles.buttonWrapper}>
                <Link href={`/historico/${item.id}`} asChild>
                  <TouchableOpacity style={globalStyles.button}><Text style={globalStyles.buttonText}>Histórico</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={alunosStyles.buttonWrapper}>
                <Link href={`/edit-aluno/${item.id}`} asChild>
                  <TouchableOpacity style={globalStyles.button}><Text style={globalStyles.buttonText}>Editar</Text></TouchableOpacity>
                </Link>
              </View>
            </View>
            <View style={alunosStyles.buttonContainer}>
              <View style={alunosStyles.buttonWrapper}>
                <Link href={{ pathname: "/aluno/[id]/avaliacao", params: { id: item.id } }} asChild>
                  <TouchableOpacity style={globalStyles.button}><Text style={globalStyles.buttonText}>Avaliação Física</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={alunosStyles.buttonWrapper}>
                <Link href={{ pathname: "/aluno/[id]/horarios", params: { id: item.id } }} asChild>
                  <TouchableOpacity style={globalStyles.button}><Text style={globalStyles.buttonText}>Aulas</Text></TouchableOpacity>
                </Link>
              </View>
              <View style={alunosStyles.buttonWrapper}>
                <TouchableOpacity style={alunosStyles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Text style={alunosStyles.deleteButtonText}>Excluir</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        style={alunosStyles.list}
      />
    </View>
  );
}


