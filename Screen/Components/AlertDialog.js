import React from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';

const AlertDialog = ({ 
    visible, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    onDismiss, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar", 
    dismissText = "Fechar" 
}) => {
    return (
        <Modal 
            transparent={true} 
            animationType="fade" 
            visible={visible} 
            onRequestClose={onDismiss} // Adicionei o método de fechamento no botão de voltar
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    {/* Título do Alerta */}
                    {title && <Text style={styles.title}>{title}</Text>}

                    {/* Mensagem do Alerta */}
                    {message && <Text style={styles.message}>{message}</Text>}

                    {/* Botões de Ação */}
                    <View style={styles.buttonContainer}>
                        {onCancel && (
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={() => {
                                    if (onCancel) onCancel(); 
                                    if (onDismiss) onDismiss(); 
                                }}
                                accessibilityLabel={cancelText}
                            >
                                <Text style={styles.buttonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        {onConfirm && (
                            <TouchableOpacity 
                                style={[styles.button, styles.confirmButton]} 
                                onPress={() => {
                                    if (onConfirm) onConfirm(); 
                                    if (onDismiss) onDismiss(); 
                                }}
                                accessibilityLabel={confirmText}
                            >
                                <Text style={styles.buttonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Botão de Fechar */}
                    {onDismiss && (
                        <TouchableOpacity 
                            style={styles.dismissButton} 
                            onPress={() => {
                                if (onDismiss) onDismiss(); 
                            }}
                            accessibilityLabel={dismissText}
                        >
                            <Text style={styles.dismissText}>{dismissText}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    dialog: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingVertical: 20,
        paddingHorizontal: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#37474F',
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        marginBottom: 25,
        color: '#424242',
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f44336', 
    },
    confirmButton: {
        backgroundColor: '#4CAF50', 
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dismissButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    dismissText: {
        color: '#007BFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AlertDialog;
