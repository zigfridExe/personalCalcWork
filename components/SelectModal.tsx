import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { theme } from '@/styles/theme';

interface SelectModalProps {
    visible: boolean;
    title: string;
    options: string[];
    onSelect: (value: string) => void;
    onClose: () => void;
    currentValue?: string;
}

export default function SelectModal({
    visible,
    title,
    options,
    onSelect,
    onClose,
    currentValue
}: SelectModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{title.toUpperCase()}</Text>
                            </View>

                            <FlatList
                                data={options}
                                keyExtractor={(item, index) => `${item}-${index}`}
                                showsVerticalScrollIndicator={false}
                                style={styles.list}
                                contentContainerStyle={styles.listContent}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.optionButton,
                                            currentValue === item && styles.optionButtonSelected
                                        ]}
                                        onPress={() => {
                                            onSelect(item);
                                            onClose();
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                currentValue === item && styles.optionTextSelected
                                            ]}
                                        >
                                            {item.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                            />

                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>CANCELAR</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        alignItems: 'center',
    },
    title: {
        color: theme.colors.primary,
        fontFamily: theme.fonts.title,
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    list: {
        maxHeight: 400,
    },
    listContent: {
        paddingVertical: 10,
    },
    optionButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionButtonSelected: {
        backgroundColor: 'rgba(255, 183, 0, 0.1)', // Primary color opacity
    },
    optionText: {
        color: theme.colors.text,
        fontSize: 18,
        fontFamily: theme.fonts.bold,
        textAlign: 'center',
    },
    optionTextSelected: {
        color: theme.colors.primary,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.border,
        width: '90%',
        alignSelf: 'center',
    },
    closeButton: {
        paddingVertical: 15,
        backgroundColor: theme.colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    closeButtonText: {
        color: theme.colors.text,
        fontFamily: theme.fonts.bold,
        fontSize: 16,
        letterSpacing: 0.5,
    },
});
