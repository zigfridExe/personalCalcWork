import { RRule, RRuleSet } from 'rrule';

// Definições de Tipos
export interface RegraRecorrencia {
    id: number;
    aluno_id: number;
    dia_semana: number; // 0=Dom, 1=Seg, ... 6=Sab
    hora_inicio: string; // HH:MM
    duracao_minutos: number;
    data_inicio_vigencia: string; // YYYY-MM-DD
    data_fim_vigencia?: string | null;
}

export interface EventoConcreto {
    id: number;
    aluno_id: number;
    data_aula: string; // YYYY-MM-DD
    hora_inicio: string;
    tipo_aula: 'AVULSA' | 'REALIZADA' | 'CANCELADA' | 'FALTA';
    status_presenca?: number; // 0=Agendada, 1=Presente, ...
    observacoes?: string;
    recorrencia_id?: number | null; // Se for uma instância concreta de uma regra
}

export interface AulaCalendario {
    key: string; // ID único virtual para renderização (ex: "rule-1-2026-05-10" ou "evt-50")
    id?: number; // ID real se for concreto
    aluno_id: number;
    data: string; // YYYY-MM-DD
    hora: string; // HH:MM
    duracao: number;
    tipo: 'VIRTUAL' | 'CONCRETA'; // Virtual = gerada pela regra, Concreta = salva no banco
    status: 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'FALTA';
    observacoes?: string;
    recorrencia_id?: number;
}

/**
 * Função Pura: Gera a lista visual de aulas para um intervalo de datas.
 * Mescla as Regras (Virtuais) com os Eventos Concretos (Reais).
 */
export function gerarCalendarioVisual(
    inicioPeriodo: Date,
    fimPeriodo: Date,
    regras: RegraRecorrencia[],
    eventosConcretos: EventoConcreto[]
): AulaCalendario[] {
    const aulasVisuais: AulaCalendario[] = [];
    const mapConcretos = new Map<string, EventoConcreto>();

    // 1. Indexar eventos concretos por "Data + Aluno" (ou só Data/Hora se preferir)
    // Chave composta para identificar colisão: "aluno_id|YYYY-MM-DD|HH:MM"
    eventosConcretos.forEach(evt => {
        const key = `${evt.aluno_id}|${evt.data_aula}|${evt.hora_inicio}`;
        mapConcretos.set(key, evt);

        // Adiciona todos os concretos à lista visual (eles sempre prevalecem)
        // Se for um CANCELAMENTO, ele entra como 'CANCELADA'
        aulasVisuais.push({
            key: `evt-${evt.id}`,
            id: evt.id,
            aluno_id: evt.aluno_id,
            data: evt.data_aula,
            hora: evt.hora_inicio,
            duracao: 0, // TODO: Pegar do banco se tiver, ou padrão
            tipo: 'CONCRETA',
            status: mapStatus(evt.tipo_aula, evt.status_presenca),
            observacoes: evt.observacoes,
            recorrencia_id: evt.recorrencia_id || undefined
        });
    });

    // 2. Expandir Regras para criar Aulas Virtuais
    regras.forEach(regra => {
        // Configura o RRule para o dia da semana específico
        // OBS: RRule usa 0=Segunda... mas JS Date 0=Domingo.
        // RRule.MO, TU, WE, TH, FR, SA, SU
        const rruleDay = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA][regra.dia_semana];

        // Data de início da regra (ajustada para UTC para evitar problemas de fuso na geração pura)
        const dtStart = new Date(regra.data_inicio_vigencia + 'T00:00:00');

        // Define limites
        const rule = new RRule({
            freq: RRule.WEEKLY,
            byweekday: rruleDay,
            dtstart: dtStart,
            until: regra.data_fim_vigencia ? new Date(regra.data_fim_vigencia + 'T23:59:59') : undefined
        });

        // Gera datas dentro do intervalo solicitado
        const datasGeradas = rule.between(inicioPeriodo, fimPeriodo, true);

        datasGeradas.forEach(dataObj => {
            const dataStr = dataObj.toISOString().slice(0, 10);
            const chaveColisao = `${regra.aluno_id}|${dataStr}|${regra.hora_inicio}`;

            // Se NÃO existe um evento concreto "matando" ou "mudando" essa data, adiciona a virtual
            if (!mapConcretos.has(chaveColisao)) {
                aulasVisuais.push({
                    key: `rule-${regra.id}-${dataStr}`,
                    aluno_id: regra.aluno_id,
                    data: dataStr,
                    hora: regra.hora_inicio,
                    duracao: regra.duracao_minutos,
                    tipo: 'VIRTUAL',
                    status: 'AGENDADA', // Padrão para virtual
                    recorrencia_id: regra.id
                });
            }
        });
    });

    // Ordenar por data e hora
    return aulasVisuais.sort((a, b) => {
        if (a.data !== b.data) return a.data.localeCompare(b.data);
        return a.hora.localeCompare(b.hora);
    });
}

function mapStatus(tipo: string, presenca?: number): 'AGENDADA' | 'REALIZADA' | 'CANCELADA' | 'FALTA' {
    if (tipo === 'CANCELADA') return 'CANCELADA';
    if (tipo === 'FALTA' || presenca === 2) return 'FALTA';
    if (tipo === 'REALIZADA' || presenca === 1) return 'REALIZADA';
    return 'AGENDADA';
}
