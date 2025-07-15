import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../styles/theme'; // Adjust path if needed

export default function LoginScreen({ navigation, onLogin }) {

  const handleBiometricLogin = async () => {
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (isEnrolled) {
        const { success } = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login to Finance Tracker',
        });
        if (success) {
            onLogin(); // Navigate to HomeScreen
        }
    } else {
        Alert.alert('No Biometrics', 'Please set up biometrics on your device.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="wallet-outline" size={60} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Finance Tracker</Text>
        <Text style={styles.subtitle}>Secure Private Automated</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.loginButton, {backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary}]}
          onPress={() => navigation.navigate('EmailLogin')}
        >
          <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.loginButtonText, {color: theme.colors.text_primary}]}>
            Login with Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.loginButton, {backgroundColor: theme.colors.primary}]}
          onPress={handleBiometricLogin}
        >
          <Ionicons name="finger-print-outline" size={24} color={theme.colors.white} />
          <Text style={styles.loginButtonText}>Use Biometric</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontSize: theme.fontSize['3xl'],
        fontWeight: 'bold',
        color: theme.colors.text_primary,
    },
    subtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.text_secondary,
        marginTop: theme.spacing.sm,
    },
    content: {
        gap: theme.spacing.md,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.md,
    },
    loginButtonText: {
        fontSize: theme.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.white,
    },
});
