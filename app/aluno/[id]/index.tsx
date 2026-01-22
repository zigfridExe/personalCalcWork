import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import useAlunosStore from '../../../store/useAlunosStore';
import { theme } from '@/styles/theme';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';

export default function AlunoDetalhesScreen() {
    const { id } = useLocalSearchParams();
    const { alunos } = useAlunosStore();
    const router = useRouter();

    const aluno = alunos.find((a: any) => a.id === Number(id));

    if (!aluno) {
        return (
            <View style={styles.container}>
                <ScreenHeader title="Aluno não encontrado" />
                <Text style={{ padding: 20 }}>Aluno não encontrado.</Text>
            </View>
        );
    }

    function formatarTelefone(telefone: string) {
        if (!telefone) return 'Não informado';
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

    const handleWhatsApp = () => {
        if (!aluno.contato) {
            Alert.alert('Erro', 'Telefone não cadastrado.');
            return;
        }
        const numero = aluno.contato.replace(/\D/g, '');
        const url = `whatsapp://send?phone=55${numero}`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Erro', 'WhatsApp não está instalado neste dispositivo.');
            }
        });
    };

    const handleCall = () => {
        if (!aluno.contato) {
            Alert.alert('Erro', 'Telefone não cadastrado.');
            return;
        }
        const numero = aluno.contato.replace(/\D/g, '');
        const url = `tel:${numero}`;
        Linking.openURL(url);
    };

    const ActionButton = ({ icon, title, subtitle, color, href }: { icon: any, title: string, subtitle?: string, color: string, href: string }) => (
        <Link href={href as any} asChild>
            <TouchableOpacity style={styles.listButton}>
                <View style={[styles.iconBox, { backgroundColor: color }]}>
                    <Ionicons name={icon} size={24} color="#fff" />
                </View>
                <View style={styles.buttonTexts}>
                    <Text style={styles.buttonTitle}>{title}</Text>
                    {subtitle && <Text style={styles.buttonSubtitle}>{subtitle}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
        </Link>
    );

    return (
        <View style={styles.container}>
            <ScreenHeader title="Detalhes do Aluno" />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.headerProfile}>
                    <View style={styles.avatarContainer}>
                        {aluno.fotoUri ? (
                            <Image source={{ uri: aluno.fotoUri }} style={styles.avatar} />
                        ) : (
                            <Text style={styles.avatarText}>{aluno.nome.charAt(0).toUpperCase()}</Text>
                        )}
                    </View>
                    <Text style={styles.nome}>{aluno.nome}</Text>
                </View>

                {/* Card de Contato */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Contato e Informações</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>
                            Nascimento: {formatDate(aluno.data_nascimento)}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{formatarTelefone(aluno.contato || '')}</Text>
                    </View>

                    <View style={styles.contactButtons}>
                        <TouchableOpacity style={[styles.contactBtn, styles.whatsappBtn]} onPress={handleWhatsApp}>
                            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                            <Text style={styles.contactBtnText}>WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={handleCall}>
                            <Ionicons name="call" size={20} color="#fff" />
                            <Text style={styles.contactBtnText}>Ligar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Lista de Ações */}
                <Text style={styles.sectionHeader}>Ações Rápidas</Text>

                <View style={styles.actionsList}>
                    <ActionButton
                        icon="fitness"
                        title="Fichas de Treino"
                        subtitle="Gerenciar exercícios e séries"
                        color={theme.colors.primary}
                        href={`/aluno/${id}/fichas`}
                    />
                    <ActionButton
                        icon="body"
                        title="Avaliação Física"
                        subtitle="Medidas e composição corporal"
                        color={theme.colors.success} // Ajustado para success (verde)
                        href={`/aluno/${id}/avaliacao`}
                    />
                    <ActionButton
                        icon="time"
                        title="Horários"
                        subtitle="Agenda de aulas"
                        color={theme.colors.info}
                        href={`/aluno/${id}/horarios`}
                    />
                    <ActionButton
                        icon="create"
                        title="Editar Dados"
                        subtitle="Alterar cadastro do aluno"
                        color={theme.colors.warning}
                        href={`/edit-aluno/${id}`}
                    />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    headerProfile: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 40,
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.title,
    },
    nome: {
        fontSize: 22,
        fontFamily: theme.fonts.title,
        color: theme.colors.text,
        textAlign: 'center',
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        padding: 16,
        marginBottom: 24,
        elevation: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: theme.fonts.secondary,
        color: theme.colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    infoText: {
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: theme.fonts.regular,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 12,
    },
    contactButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    contactBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: theme.borderRadius.sm,
        gap: 8,
    },
    whatsappBtn: {
        backgroundColor: '#25D366', // Cor oficial WhatsApp
    },
    callBtn: {
        backgroundColor: theme.colors.info,
    },
    contactBtnText: {
        color: '#fff',
        fontFamily: theme.fonts.title,
        fontSize: 14,
    },
    sectionHeader: {
        fontSize: 18,
        fontFamily: theme.fonts.title,
        color: theme.colors.text,
        marginBottom: 12,
    },
    actionsList: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    listButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    buttonTexts: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 16,
        fontFamily: theme.fonts.title,
        color: theme.colors.text,
        marginBottom: 2,
    },
    buttonSubtitle: {
        fontSize: 12,
        fontFamily: theme.fonts.regular,
        color: theme.colors.textSecondary,
    },
});
