import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CustomButton from '../components/CustomButton';

export default function SettingsScreen({ navigation }) {
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [isPinModalVisible, setPinModalVisible] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const settingSections = [
        {
            title: 'Account',
            items: [
                { icon: 'person-outline', title: 'Edit Profile', type: 'navigation', onPress: () => navigation.navigate('Profile') },
                { icon: 'lock-closed-outline', title: 'Change PIN', type: 'navigation', onPress: () => setPinModalVisible(true) },
            ],
        },
        {
            title: 'Security',
            items: [
                { icon: 'finger-print-outline', title: 'Biometric Login', type: 'switch', value: biometricEnabled, onToggle: setBiometricEnabled },
            ],
        },
        {
            title: 'Support',
            items: [
                { icon: 'help-circle-outline', title: 'Help & FAQ', type: 'navigation', onPress: () => Alert.alert('Info', 'Help section coming soon') },
                { icon: 'information-circle-outline', title: 'About', type: 'navigation', onPress: () => navigation.navigate('About') },
            ],
        },
    ];

    const handleSavePin = () => {
        if (newPin.length < 4 || confirmPin.length < 4) {
            Alert.alert('Error', 'New PIN must be 4 digits.');
            return;
        }
        if (newPin !== confirmPin) {
            Alert.alert('Error', 'New PIN and Confirm PIN do not match.');
            return;
        }
        Alert.alert('Success', 'PIN changed successfully.');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setPinModalVisible(false);
    };

    const renderSettingItem = (item, index) => (
        <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={item.onPress}
            disabled={item.type === 'switch'}
            activeOpacity={0.7}
        >
            <View style={styles.settingIcon}>
                <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
            </View>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <View style={styles.settingAction}>
                {item.type === 'switch' ? (
                    <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: theme.colors.gray[700], true: theme.colors.primary }}
                        thumbColor={theme.colors.white}
                        ios_backgroundColor={theme.colors.gray[700]}
                    />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text_secondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {settingSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.sectionContent}>
                        {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
                    </View>
                </View>
            ))}
            <View style={styles.footer}>
                <Text style={styles.footerText}>BudgetMate Version 1.0.0</Text>
            </View>

            <Modal
                visible={isPinModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setPinModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.pinModalContainer}>
                        <Text style={styles.modalTitle}>Change PIN</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Current PIN"
                            placeholderTextColor={theme.colors.text_secondary}
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={4}
                            value={currentPin}
                            onChangeText={setCurrentPin}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="New PIN"
                            placeholderTextColor={theme.colors.text_secondary}
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={4}
                            value={newPin}
                            onChangeText={setNewPin}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Confirm New PIN"
                            placeholderTextColor={theme.colors.text_secondary}
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={4}
                            value={confirmPin}
                            onChangeText={setConfirmPin}
                        />
                        <View style={styles.modalButtonRow}>
                            <CustomButton title="Cancel" onPress={() => setPinModalVisible(false)} variant="secondary" />
                            <CustomButton title="Save" onPress={handleSavePin} />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    section: {
        marginTop: theme.spacing.lg,
        marginHorizontal: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.text_secondary,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    settingTitle: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.text_primary,
    },
    settingAction: {
        justifyContent: 'center',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    footerText: {
        color: theme.colors.text_secondary,
        fontSize: theme.fontSize.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pinModalContainer: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        color: theme.colors.text_primary,
        textAlign: 'center',
        fontSize: 18,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.spacing.md,
    },
});
