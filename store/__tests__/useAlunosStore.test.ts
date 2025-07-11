import useAlunosStore from './../useAlunosStore';

// Mock do banco de dados para evitar operações reais durante o teste
jest.mock('../../utils/databaseUtils', () => ({
  getDatabase: jest.fn().mockResolvedValue({
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  checkAndFixDatabase: jest.fn().mockResolvedValue(undefined),
  resetDatabase: jest.fn().mockResolvedValue(undefined),
}));

describe('useAlunosStore', () => {
  beforeEach(() => {
    // Limpa o estado antes de cada teste
    useAlunosStore.setState({ alunos: [] });
  });

  it('deve adicionar um novo aluno ao estado', async () => {
    const { addAluno, alunos } = useAlunosStore.getState();
    await addAluno('João da Silva', 'ativo', '11999999999', 'foto.jpg', 60);
    const alunosAtualizados = useAlunosStore.getState().alunos;
    expect(alunosAtualizados.length).toBe(1);
    expect(alunosAtualizados[0]).toMatchObject({
      id: 1,
      nome: 'João da Silva',
      status: 'ativo',
      contato: '11999999999',
      fotoUri: 'foto.jpg',
      lembrete_hidratacao_minutos: 60,
    });
  });
}); 