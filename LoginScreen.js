import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen({ onLogin }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleBiometricLogin = async () => {
        setIsLoading(true);
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                Alert.alert('Error', 'Your device does not support biometric authentication.');
                setIsLoading(false);
                return;
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                Alert.alert('Error', 'No biometrics are enrolled on this device.');
                setIsLoading(false);
                return;
            }

            const { success } = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login to BudgetMate', // Updated App Name
            });

            if (success) {
                onLogin();
            } else {
                Alert.alert('Error', 'Authentication failed or was canceled.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred during authentication.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinLogin = () => {
        // This can be updated later to use the PIN modal
        Alert.alert(
            'PIN Login',
            'PIN login feature would be implemented here.',
            [{ text: 'Cancel' }, { text: 'Continue', onPress: onLogin }]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Ionicons name="wallet" size={80} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>BudgetMate</Text>
                <Text style={styles.subtitle}>
                    Secure. Private. Automated.
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.welcomeText}>Welcome Back!</Text>
                <Text style={styles.descriptionText}>
                    Please authenticate to access your financial data
                </Text>
                <View style={styles.loginOptions}>
                    <TouchableOpacity
                        style={[styles.loginButton, styles.biometricButton]}
                        onPress={handleBiometricLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <>
                                <Ionicons
                                    name="finger-print"
                                    size={24}
                                    color={theme.colors.white}
                                />
                                <Text style={styles.loginButtonText}>Use Biometric</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.loginButton, styles.pinButton]}
                        onPress={handlePinLogin}
                    >
                        <Ionicons
                            name="keypad"
                            size={24}
                            color={theme.colors.primary}
                        />
                        <Text style={[styles.loginButtonText, styles.pinButtonText]}>
                            Use PIN
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Your data is encrypted and stored locally on your device
                </Text>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.light,
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        fontSize: theme.fontSize['3xl'],
        fontWeight: 'bold',
        color: theme.colors.dark,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.gray[500],
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: theme.fontSize['2xl'],
        fontWeight: 'bold',
        color: theme.colors.dark,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    descriptionText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.gray[500],
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    loginOptions: {
        gap: theme.spacing.md,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.sm,
    },
    biometricButton: {
        backgroundColor: theme.colors.primary,
    },
    pinButton: {
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    loginButtonText: {
        fontSize: theme.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.white,
    },
    pinButtonText: {
        color: theme.colors.primary,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    footerText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.gray[500],
        textAlign: 'center',
    },
});
