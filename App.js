import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const authStatus = await AsyncStorage.getItem('isAuthenticated');
            if (authStatus === 'true') {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            await AsyncStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error saving auth status:', error);
            setIsAuthenticated(true); // Fallback
        }
    };

    // Direct logout function
    const handleLogout = async () => {
        console.log('Logout initiated...');
        try {
            // Clear authentication from storage
            await AsyncStorage.removeItem('isAuthenticated');
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
        
        // Always set authenticated to false (even if storage fails)
        setIsAuthenticated(false);
        console.log('User logged out, showing login screen');
    };

    if (isLoading) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <View style={styles.loadingContainer}>
                        {/* Add loading spinner if needed */}
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <UserProvider>
            <SafeAreaProvider>
                <NavigationContainer>
                    <SafeAreaView style={styles.container}>
                        {isAuthenticated ? (
                            <AppNavigator onLogout={handleLogout} />
                        ) : (
                            <LoginScreen onLogin={handleLogin} />
                        )}
                    </SafeAreaView>
                </NavigationContainer>
            </SafeAreaProvider>
        </UserProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
