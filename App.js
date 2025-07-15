import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import EmailLoginScreen from './src/screens/EmailLoginScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen'; // Import the new screen

const AuthStack = createStackNavigator();

// The AuthFlow now includes the RegisterScreen
function AuthFlow({ onLogin }) {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login">
                {props => <LoginScreen {...props} onLogin={onLogin} />}
            </AuthStack.Screen>
            <AuthStack.Screen name="EmailLogin">
                {props => <EmailLoginScreen {...props} onLogin={onLogin} />}
            </AuthStack.Screen>
            <AuthStack.Screen name="Register">
                {/* The RegisterScreen doesn't need onLogin, as it just navigates back */}
                {props => <RegisterScreen {...props} />}
            </AuthStack.Screen>
        </AuthStack.Navigator>
    );
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <UserProvider>
            <SafeAreaProvider>
                <NavigationContainer>
                    <SafeAreaView style={styles.container}>
                        {isAuthenticated ? (
                            <AppNavigator />
                        ) : (
                            <AuthFlow onLogin={handleLogin} />
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
        backgroundColor: '#111827', // Your dark theme background color
    },
});
