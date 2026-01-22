/**
 * Utilitários para manipulação e formatação de datas.
 * Padronização: DD/MM/AAAA para visualização/input e YYYY-MM-DD para banco de dados/ISO.
 */

/**
 * Formata uma string de data ISO (YYYY-MM-DD) ou objeto Date para DD/MM/AAAA.
 * @param date Data em string ISO ou objeto Date
 * @returns String formatada DD/MM/AAAA
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';

    // Se for string, tentamos processar diretamente para evitar problemas de fuso horário (UTC vs Local)
    if (typeof date === 'string') {
        const datePart = date.split('T')[0]; // Pega apenas a parte da data se tiver hora
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year}`;
        }

        // Se já estiver no formato DD/MM/AAAA, retorna como está
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
            return datePart;
        }
    }

    // Fallback para objeto Date ou outros formatos
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Formata data e hora para DD/MM/AAAA HH:mm
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Aplica máscara de data (DD/MM/AAAA) em um input.
 * Permite apenas números e adiciona as barras automaticamente.
 * @param value Valor atual do input
 * @returns Valor mascarado
 */
export const maskDate = (value: string): string => {
    let v = value.replace(/\D/g, ''); // Remove tudo que não é dígito

    if (v.length > 8) {
        v = v.slice(0, 8); // Limita a 8 dígitos
    }

    if (v.length > 4) {
        return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
        return `${v.slice(0, 2)}/${v.slice(2)}`;
    }

    return v;
};

/**
 * Converte uma data no formato DD/MM/AAAA (ou DD-MM-AAAA) para o formato ISO YYYY-MM-DD.
 * Útil para salvar no banco de dados.
 * @param dateString Data no formato DD/MM/AAAA
 * @returns Data no formato YYYY-MM-DD ou string vazia se inválido
 */
export const parseToISO = (dateString: string): string => {
    if (!dateString || dateString.length !== 10) return '';

    // Suporta tanto / quanto - para robustez
    const separator = dateString.includes('/') ? '/' : '-';
    const parts = dateString.split(separator);

    if (parts.length !== 3) return '';

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // Validação básica
    const nDay = parseInt(day, 10);
    const nMonth = parseInt(month, 10);
    const nYear = parseInt(year, 10);

    if (isNaN(nDay) || isNaN(nMonth) || isNaN(nYear)) return '';
    if (nMonth < 1 || nMonth > 12) return '';
    if (nDay < 1 || nDay > 31) return '';

    return `${year}-${month}-${day}`;
};

/**
 * Verifica se uma string é uma data válida no formato DD/MM/AAAA.
 * @param dateString Data formato DD/MM/AAAA
 * @returns boolean
 */
export const isValidDate = (dateString: string): boolean => {
    if (!dateString || dateString.length !== 10) return false;

    // Regex para validar DD/MM/AAAA (aceita hifens também para legado)
    const regex = /^\d{2}[\/-]\d{2}[\/-]\d{4}$/;
    if (!regex.test(dateString)) return false;

    const iso = parseToISO(dateString);
    if (!iso) return false;

    // Confere se a data existe mesmo (ex: 31-02-2024 é inválido)
    const date = new Date(iso + 'T00:00:00');

    const [y, m, d] = iso.split('-').map(Number);

    return (
        date.getFullYear() === y &&
        date.getMonth() === m - 1 &&
        date.getDate() === d
    );
};
