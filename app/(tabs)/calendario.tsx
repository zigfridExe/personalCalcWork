import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import useAulasStore from '../../store/useAulasStore';
import { useRouter } from 'expo-router';

export default function CalendarioScreen() {
  const { aulas, carregarAulas, excluirAula, marcarPresenca } = useAulasStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAulas().then(() => setLoading(false));
  }, []);

  const handleExcluir = (id: number) => {
    Alert.alert('Excluir Aula', 'Tem certeza que deseja excluir esta aula?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirAula(id) },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.aulaItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.aulaData}>{item.data} {item.hora}</Text>
        <Text style={styles.aulaDescricao}>{item.descricao}</Text>
        <Text style={styles.aulaPresenca}>Presença: {item.presenca ? 'Sim' : 'Não'}</Text>
      </View>
      <View style={styles.botoes}>
        <TouchableOpacity onPress={() => marcarPresenca(item.id, !item.presenca)} style={styles.botaoPresenca}>
          <Text style={{ color: '#fff' }}>{item.presenca ? 'Desmarcar' : 'Marcar'} Presença</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/calendario/editar', params: { id: item.id } })} style={styles.botaoEditar}>
          <Text style={{ color: '#fff' }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleExcluir(item.id)} style={styles.botaoExcluir}>
          <Text style={{ color: '#fff' }}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário de Aulas</Text>
      <Button title="Adicionar Aula" onPress={() => router.push('/calendario/nova')} color="#4CAF50" />
      {loading ? (
        <Text style={styles.loading}>Carregando...</Text>
      ) : (
        <FlatList
          data={aulas}
          keyExtractor={item => item.id?.toString() || ''}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhuma aula agendada.</Text>}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loading: {
    marginTop: 30,
    textAlign: 'center',
  },
  list: {
    marginTop: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
  aulaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  aulaData: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  aulaDescricao: {
    fontSize: 15,
    marginBottom: 4,
  },
  aulaPresenca: {
    fontSize: 14,
    color: '#666',
  },
  botoes: {
    flexDirection: 'column',
    marginLeft: 10,
    gap: 5,
  },
  botaoPresenca: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 6,
    marginBottom: 5,
  },
  botaoEditar: {
    backgroundColor: '#FF9800',
    borderRadius: 5,
    padding: 6,
    marginBottom: 5,
  },
  botaoExcluir: {
    backgroundColor: '#f44336',
    borderRadius: 5,
    padding: 6,
  },
});
