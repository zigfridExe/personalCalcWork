import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CustomModalProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: 'success' | 'info' | 'warning' | 'error';
    onClose: () => void;
    confirmText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    children?: React.ReactNode;
}

export default function CustomModal({
    visible,
    title,
    message,
    type = 'info',
    onClose,
    confirmText = 'OK',
    onConfirm,
    showCancel = false,
    children
}: CustomModalProps) {

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'warning': return 'alert-circle';
            case 'error': return 'close-circle';
            default: return 'information-circle';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return theme.colors.success;
            case 'warning': return theme.colors.warning;
            case 'error': return theme.colors.danger;
            default: return theme.colors.primary;
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.card, { borderColor: getColor() }]}>
                    <Ionicons name={getIcon()} size={48} color={getColor()} style={styles.icon} />
                    <Text style={[styles.title, { color: getColor() }]}>{title}</Text>
                    {message && <Text style={styles.message}>{message}</Text>}

                    {children && <View style={styles.content}>{children}</View>}

                    <View style={styles.buttonRow}>
                        {showCancel && (
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: getColor() }]}
                            onPress={onConfirm || onClose}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: width * 0.85,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        elevation: 10,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: theme.fonts.title,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: theme.fonts.secondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    content: {
        width: '100%',
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        justifyContent: 'center',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#666',
    },
    cancelButtonText: {
        color: '#CCC',
        fontFamily: theme.fonts.bold,
        fontSize: 14,
    },
    confirmButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        elevation: 2,
    },
    confirmButtonText: {
        color: theme.colors.background,
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        textTransform: 'uppercase',
    },
});
