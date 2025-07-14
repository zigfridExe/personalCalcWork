import useAulasStore from '../useAulasStore';
import * as databaseUtils from '../../utils/databaseUtils';
import * as recorrenciaUtils from '../../utils/recorrenciaUtils';

jest.mock('../../utils/databaseUtils');
jest.mock('../../utils/recorrenciaUtils');

describe('useAulasStore - calendário', () => {
  let getAllAsyncMock: jest.Mock;
  let dbMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    useAulasStore.setState({ aulas: [] });
    getAllAsyncMock = jest.fn();
    dbMock = { getAllAsync: getAllAsyncMock };
    (databaseUtils.getDatabase as jest.Mock).mockResolvedValue(dbMock);
    (recorrenciaUtils.gerarAulasRecorrentesParaPeriodo as jest.Mock).mockResolvedValue(undefined);
  });

  it('deve carregar aulas do range solicitado, horários corretos e dias da semana batendo com o calendário', async () => {
    // Janeiro a Março de 2024
    const aulas = [
      { id: 1, aluno_id: 1, aluno_nome: 'João', data_aula: '2024-01-10', hora_inicio: '10:00', duracao_minutos: 60, presenca: 0, tipo_aula: 'RECORRENTE', horario_recorrente_id: 1 },
      { id: 2, aluno_id: 2, aluno_nome: 'Maria', data_aula: '2024-02-15', hora_inicio: '09:30', duracao_minutos: 45, presenca: 1, tipo_aula: 'AVULSA', horario_recorrente_id: null },
      { id: 3, aluno_id: 1, aluno_nome: 'João', data_aula: '2024-03-05', hora_inicio: '08:00', duracao_minutos: 30, presenca: 0, tipo_aula: 'RECORRENTE', horario_recorrente_id: 1 },
    ];
    getAllAsyncMock.mockResolvedValue(aulas);

    const store = useAulasStore.getState();
    // Range de 01/01/2024 a 31/03/2024
    await store.carregarAulas('2024-01-01', '2024-03-31');
    await new Promise(res => setTimeout(res, 0));

    // Deve trazer todas as aulas do range
    expect(store.aulas).toHaveLength(3);
    expect(store.aulas.map(a => a.data_aula)).toEqual([
      '2024-01-10',
      '2024-02-15',
      '2024-03-05',
    ]);

    // Horários corretos
    expect(store.aulas[0].hora_inicio).toBe('10:00');
    expect(store.aulas[1].hora_inicio).toBe('09:30');
    expect(store.aulas[2].hora_inicio).toBe('08:00');

    // Dias da semana batem com as datas
    // 2024-01-10 = Quarta (3), 2024-02-15 = Quinta (4), 2024-03-05 = Terça (2)
    const diasSemana = store.aulas.map(a => (new Date(a.data_aula).getDay()));
    expect(diasSemana).toEqual([3, 4, 2]);
  });
}); 