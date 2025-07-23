import FichasScreen from '../../../src/domains/aluno/screens/FichasScreen';
export default FichasScreen;
  const handleDeleteFicha = (fichaId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir esta ficha de treino?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => deleteFicha(fichaId), style: "destructive" },
      ]
    );
  };

  const handleDeleteExercicio = (exercicioId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir este exercício?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => deleteExercicio(exercicioId), style: "destructive" },
      ]
    );
  };

  return (
    <View style={fichasStyles.container}>
      <Text style={{color: 'red', fontWeight: 'bold'}}>Teste de montagem</Text>
      <Text style={fichasStyles.title}>Fichas de Treino {aluno ? `de ${aluno.nome}` : ''}</Text>
      <Link href={{ pathname: "/modal-ficha", params: { alunoId: alunoId } }} asChild>
        <Button title="Adicionar Nova Ficha" />
      </Link>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 24 }} />
      ) : fichas.length === 0 ? (
        <Text style={{ marginTop: 24, textAlign: 'center', color: '#888' }}>Nenhuma ficha encontrada para este aluno.</Text>
      ) : (
        <FlatList
          data={fichas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
          <View style={fichasStyles.fichaContainer}>
            <Text style={fichasStyles.fichaItem}>Nome: {item.nome}</Text>
            <Text style={fichasStyles.fichaDetail}>Objetivos: {item.objetivos}</Text>
            <Text style={fichasStyles.fichaDetail}>Professor: {item.professor}</Text>
            <View style={fichasStyles.buttonsContainer}>
              <Link href={{ pathname: "/ficha/[id]/visualizar", params: { id: item.id } }} asChild>
                <Button title="Visualizar" color="#2196F3" />
              </Link>
              <Link href={{ pathname: "/modal-copiar-ficha", params: { fichaId: item.id } }} asChild>
                <Button title="📋 Copiar" color="#FF9800" />
              </Link>
              <Link href={{ pathname: "/modal-ficha", params: { fichaId: item.id, alunoId: alunoId } }} asChild>
                <Button title="Editar" />
              </Link>
              <Button title="Excluir" onPress={() => handleDeleteFicha(item.id)} color="red" />
            </View>
            {/* Listagem de exercícios da ficha */}
            <Text style={fichasStyles.fichaDetail}>Exercícios:</Text>
            <Link href={{ pathname: "/modal-exercicio", params: { fichaId: item.id } }} asChild>
              <Button title="Adicionar Novo Exercício" />
            </Link>
            <FlatList
              data={exercicios.filter(e => e.ficha_id === item.id)}
              keyExtractor={(ex) => ex.id.toString()}
              renderItem={({ item: ex }) => (
                <View style={fichasStyles.exercicioContainer}>
                  <Text style={fichasStyles.exercicioItem}>Nome: {ex.nome}</Text>
                  {ex.grupo_muscular && <Text style={fichasStyles.exercicioDetail}>Grupo Muscular: {ex.grupo_muscular}</Text>}
                  {ex.series && <Text style={fichasStyles.exercicioDetail}>Séries: {ex.series}</Text>}
                  {ex.repeticoes && <Text style={fichasStyles.exercicioDetail}>Repetições: {ex.repeticoes}</Text>}
                  {ex.carga && <Text style={fichasStyles.exercicioDetail}>Carga: {ex.carga}</Text>}
                  {ex.ajuste && <Text style={fichasStyles.exercicioDetail}>Ajuste: {ex.ajuste}</Text>}
                  <View style={fichasStyles.buttonsContainer}>
                    <Link href={{ pathname: "/modal-exercicio", params: { exercicioId: ex.id, fichaId: ex.ficha_id } }} asChild>
                      <Button title="Editar" />
                    </Link>
                    <Button title="Excluir" onPress={() => handleDeleteExercicio(ex.id)} color="red" />
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={fichasStyles.emptyText}>Nenhum exercício cadastrado para esta ficha.</Text>}
              style={fichasStyles.list}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={fichasStyles.emptyText}>Nenhuma ficha encontrada para este aluno.</Text>}
      />
      )}
    </View>
  );
}
