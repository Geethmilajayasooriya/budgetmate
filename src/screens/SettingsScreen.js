import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { clearAllTransactions, getAllTransactionsForExport } from '../services/firebaseService';
import { theme } from '../styles/theme';

export default function SettingsScreen({ navigation, onLogout }) {
    const { userName, setUserName, profileImage, setProfileImage } = useUser();
    const [smsEnabled, setSmsEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [tempUserName, setTempUserName] = useState(userName || 'User');
    
    const [isPinModalVisible, setPinModalVisible] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const [isExportModalVisible, setExportModalVisible] = useState(false);

    useEffect(() => {
        checkBiometricAvailability();
        loadBiometricPreference();
    }, []);

    const checkBiometricAvailability = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            const available = compatible && enrolled;
            
            setBiometricAvailable(available);
            console.log('Biometric available:', available);
        } catch (error) {
            console.error('Error checking biometric:', error);
            setBiometricAvailable(false);
        }
    };

    const loadBiometricPreference = async () => {
        try {
            const enabled = await AsyncStorage.getItem('biometricEnabled');
            if (enabled === 'true') {
                setBiometricEnabled(true);
            }
        } catch (error) {
            console.error('Error loading biometric preference:', error);
        }
    };

    const handleBiometricToggle = async (value) => {
        if (!biometricAvailable) {
            Alert.alert(
                'Not Available',
                'Biometric authentication is not available on this device. Please ensure you have fingerprint or Face ID set up in your device settings.'
            );
            return;
        }

        if (value) {
            try {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Authenticate to enable biometric login',
                    fallbackLabel: 'Use PIN',
                });

                if (result.success) {
                    await AsyncStorage.setItem('biometricEnabled', 'true');
                    setBiometricEnabled(true);
                    Alert.alert('Success', 'Biometric login enabled!');
                } else {
                    Alert.alert('Failed', 'Biometric authentication failed');
                }
            } catch (error) {
                console.error('Biometric auth error:', error);
                Alert.alert('Error', 'Failed to enable biometric login');
            }
        } else {
            await AsyncStorage.setItem('biometricEnabled', 'false');
            setBiometricEnabled(false);
            Alert.alert('Disabled', 'Biometric login disabled');
        }
    };

    const handleChangePinSave = async () => {
        if (newPin !== confirmPin) {
            Alert.alert('Error', 'New PIN and Confirm PIN do not match.');
            return;
        }
        if (newPin.length < 4) {
            Alert.alert('Error', 'PIN must be at least 4 digits.');
            return;
        }
        
        try {
            const storedPin = await AsyncStorage.getItem('userPin');
            
            if (storedPin && storedPin !== currentPin) {
                Alert.alert('Error', 'Current PIN is incorrect.');
                return;
            }
            
            await AsyncStorage.setItem('userPin', newPin);
            console.log('✅ PIN saved successfully');
            
            Alert.alert('Success', 'PIN changed successfully.');
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');
            setPinModalVisible(false);
        } catch (error) {
            console.error('❌ Error saving PIN:', error);
            Alert.alert('Error', 'Failed to save PIN. Please try again.');
        }
    };

    const handleExportData = async () => {
        setExportModalVisible(false);
        
        try {
            console.log('🔵 Starting export...');
            const transactions = await getAllTransactionsForExport();
            
            if (transactions.length === 0) {
                Alert.alert('No Data', 'You don\'t have any transactions to export.');
                return;
            }

            let csvContent = 'Date,Title,Amount,Type,Category,Note\n';
            
            transactions.forEach(transaction => {
                let formattedDate = 'N/A';
                try {
                    if (transaction.date) {
                        if (typeof transaction.date === 'string') {
                            formattedDate = new Date(transaction.date).toLocaleDateString('en-US');
                        } else if (transaction.date.toDate) {
                            formattedDate = transaction.date.toDate().toLocaleDateString('en-US');
                        } else if (transaction.date instanceof Date) {
                            formattedDate = transaction.date.toLocaleDateString('en-US');
                        }
                    } else if (transaction.createdAt) {
                        if (transaction.createdAt.toDate) {
                            formattedDate = transaction.createdAt.toDate().toLocaleDateString('en-US');
                        } else if (typeof transaction.createdAt === 'string') {
                            formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US');
                        }
                    }
                } catch (dateError) {
                    console.error('Date parsing error:', dateError);
                    formattedDate = 'Invalid Date';
                }
                
                const title = `"${(transaction.title || 'Untitled').replace(/"/g, '""')}"`;
                const amount = transaction.amount || 0;
                const type = transaction.type || 'expense';
                const category = transaction.category || 'other';
                const note = `"${(transaction.note || '').replace(/"/g, '""')}"`;
                
                csvContent += `${formattedDate},${title},${amount},${type},${category},${note}\n`;
            });

            const fileName = `FinanceTracker_Export_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            
            console.log('🔵 Saving to:', fileUri);
            
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            console.log('✅ File saved');

            const isAvailable = await Sharing.isAvailableAsync();
            console.log('🔵 Sharing available:', isAvailable);

            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Transactions',
                    UTI: 'public.comma-separated-values-text',
                });
                
                Alert.alert(
                    'Export Successful!',
                    `${transactions.length} transactions exported.`
                );
            } else {
                Alert.alert(
                    'Export Saved',
                    `File saved!\n\nLocation: ${fileUri}\n\nTransactions: ${transactions.length}\n\nYou can find this file in your device's file manager.`
                );
            }
        } catch (error) {
            console.error('🔴 Export error:', error);
            Alert.alert('Export Failed', `Error: ${error.message}`);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            '⚠️ Clear All Data',
            'This will permanently delete ALL your transactions. Your budgets and settings will remain intact.\n\nThis action CANNOT be undone!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const count = await clearAllTransactions();
                            Alert.alert(
                                'Data Cleared',
                                `Successfully deleted ${count} transactions.`
                            );
                        } catch (error) {
                            console.error('🔴 Clear data error:', error);
                            Alert.alert('Error', 'Failed to clear data. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleContactSupport = async () => {
        const email = 'support@financetracker.app';
        const subject = 'Support Request - Finance Tracker App';
        const body = `Hi Finance Tracker Support Team,

I need help with:

[Please describe your issue here]

---
App Version: 1.0.0
Device: ${Platform.OS}
User: ${userName}
`;

        const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        try {
            const supported = await Linking.canOpenURL(mailto);
            console.log('📧 Email supported:', supported);
            
            if (supported) {
                await Linking.openURL(mailto);
            } else {
                Alert.alert(
                    'Contact Support',
                    `Email: ${email}\n\nPlease copy this email and send us a message describing your issue.`,
                    [
                        { text: 'OK' }
                    ]
                );
            }
        } catch (error) {
            console.error('🔴 Email error:', error);
            Alert.alert(
                'Contact Support',
                `Please email us at:\n${email}\n\nDescribe your issue and we'll help you!`
            );
        }
    };

    const handleLogout = () => {
        console.log('🔴 Logout button pressed');
        if (onLogout && typeof onLogout === 'function') {
            onLogout();
        } else {
            console.error('❌ onLogout function not available');
        }
    };

    const settingSections = [
        {
            title: 'Security',
            items: [
                { 
                    icon: 'finger-print', 
                    title: 'Biometric Login', 
                    type: 'switch', 
                    value: biometricEnabled, 
                    onToggle: handleBiometricToggle,
                    disabled: !biometricAvailable
                },
                { 
                    icon: 'lock-closed', 
                    title: 'Change PIN', 
                    type: 'navigation', 
                    onPress: () => setPinModalVisible(true) 
                },
            ],
        },
        {
            title: 'Automation',
            items: [
                { 
                    icon: 'chatbubble-ellipses', 
                    title: 'SMS Detection', 
                    type: 'switch', 
                    value: smsEnabled, 
                    onToggle: setSmsEnabled 
                },
                { 
                    icon: 'notifications', 
                    title: 'Push Notifications', 
                    type: 'switch', 
                    value: notificationsEnabled, 
                    onToggle: setNotificationsEnabled 
                },
            ],
        },
        {
            title: 'Data Management',
            items: [
                { 
                    icon: 'cloud-download', 
                    title: 'Export Data', 
                    type: 'navigation', 
                    onPress: () => setExportModalVisible(true) 
                },
                { 
                    icon: 'trash', 
                    title: 'Clear Data', 
                    type: 'navigation', 
                    onPress: handleClearData 
                },
            ],
        },
        {
            title: 'Support',
            items: [
                { 
                    icon: 'help-circle', 
                    title: 'Help & FAQ', 
                    type: 'navigation', 
                    onPress: () => navigation.navigate('HelpFAQ') 
                },
                { 
                    icon: 'mail', 
                    title: 'Contact Support', 
                    type: 'navigation', 
                    onPress: handleContactSupport 
                },
                { 
                    icon: 'information-circle', 
                    title: 'About', 
                    type: 'navigation', 
                    onPress: () => navigation.navigate('About') 
                },
            ],
        },
    ];

    const handleSaveName = () => {
        setUserName(tempUserName);
        Alert.alert("Success", "Your name has been updated.");
    };

    const handleChangeProfilePicture = () => {
        Alert.alert(
            "Change Profile Picture",
            "Choose an option",
            [
                { text: "Take Photo...", onPress: takePhoto },
                { text: "Choose from Gallery...", onPress: chooseFromGallery },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
            return;
        }
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const chooseFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery access is required to choose a photo.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const renderSettingItem = (item, index) => (
        <TouchableOpacity
            key={index}
            style={[
                styles.settingItem,
                index === settingSections.find(section => section.items.includes(item))?.items.length - 1 && styles.lastItem
            ]}
            onPress={item.onPress}
            disabled={item.type === 'switch' || item.disabled}
            activeOpacity={0.7}
        >
            <View style={styles.settingIcon}>
                <Ionicons 
                    name={item.icon} 
                    size={22} 
                    color={item.disabled ? theme.colors.text_secondary : theme.colors.primary} 
                />
            </View>
            <Text style={[
                styles.settingTitle,
                item.disabled && styles.disabledText
            ]}>
                {item.title}
                {item.disabled && ' (Not Available)'}
            </Text>
            <View style={styles.settingAction}>
                {item.type === 'switch' ? (
                    <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        disabled={item.disabled}
                        trackColor={{ false: '#374151', true: theme.colors.primary }}
                        thumbColor={theme.colors.white}
                        ios_backgroundColor="#374151"
                    />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text_secondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={() => profileImage && setImageModalVisible(true)}>
                    <Image
                        source={profileImage ? { uri: profileImage } : { uri: 'https://placehold.co/100x100/1f2937/f9fafb?text=U' }}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity style={styles.editIcon} onPress={handleChangeProfilePicture}>
                        <Ionicons name="camera-outline" size={20} color={theme.colors.white} />
                    </TouchableOpacity>
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                    <TextInput 
                        style={styles.profileNameInput}
                        value={tempUserName}
                        onChangeText={setTempUserName}
                        onBlur={handleSaveName}
                        placeholder="Enter your name"
                        placeholderTextColor={theme.colors.text_secondary}
                    />
                    <Text style={styles.profileEmail}>Your personal account</Text>
                </View>
            </View>

            {settingSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.sectionContent}>
                        {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
                    </View>
                </View>
            ))}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.sectionContent}>
                    <TouchableOpacity
                        style={[styles.settingItem, styles.logoutItem, styles.lastItem]}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.settingIcon, styles.logoutIcon]}>
                            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                        </View>
                        <Text style={[styles.settingTitle, styles.logoutText]}>Logout</Text>
                        <View style={styles.settingAction}>
                            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* IMAGE MODAL */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.imageModalContainer}>
                    <Image source={{ uri: profileImage }} style={styles.fullScreenImage} />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setImageModalVisible(false)}
                    >
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* EXPORT DATA MODAL */}
            <Modal
                visible={isExportModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setExportModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.exportModalContainer}>
                        <Ionicons name="cloud-download-outline" size={64} color={theme.colors.primary} />
                        <Text style={styles.modalTitle}>Export Your Data</Text>
                        <Text style={styles.modalDescription}>
                            Export all your transactions to a CSV file. This file can be opened in Excel, Google Sheets, or any spreadsheet app.
                        </Text>
                        
                        <View style={styles.exportInfoBox}>
                            <View style={styles.exportInfoRow}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                                <Text style={styles.exportInfoText}>All transactions included</Text>
                            </View>
                            <View style={styles.exportInfoRow}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                                <Text style={styles.exportInfoText}>Date, amount, category, notes</Text>
                            </View>
                            <View style={styles.exportInfoRow}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                                <Text style={styles.exportInfoText}>Compatible with Excel & Sheets</Text>
                            </View>
                        </View>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setExportModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonConfirm}
                                onPress={handleExportData}
                            >
                                <Ionicons name="download-outline" size={20} color={theme.colors.white} />
                                <Text style={[styles.modalButtonText, { marginLeft: 8 }]}>Export Now</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* CHANGE PIN MODAL */}
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
                            placeholder="Current PIN"
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={6}
                            value={currentPin}
                            onChangeText={setCurrentPin}
                            style={styles.modalInput}
                            placeholderTextColor={theme.colors.text_secondary}
                        />
                        <TextInput
                            placeholder="New PIN"
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={6}
                            value={newPin}
                            onChangeText={setNewPin}
                            style={styles.modalInput}
                            placeholderTextColor={theme.colors.text_secondary}
                        />
                        <TextInput
                            placeholder="Confirm New PIN"
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={6}
                            value={confirmPin}
                            onChangeText={setConfirmPin}
                            style={styles.modalInput}
                            placeholderTextColor={theme.colors.text_secondary}
                        />

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => {
                                    setCurrentPin('');
                                    setNewPin('');
                                    setConfirmPin('');
                                    setPinModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonSave}
                                onPress={handleChangePinSave}
                            >
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    profileHeader: { alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, margin: theme.spacing.md, borderRadius: theme.borderRadius.lg },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: theme.colors.primary },
    editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, padding: 8, borderRadius: 20 },
    profileInfo: { alignItems: 'center', marginTop: theme.spacing.md },
    profileNameInput: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text_primary, padding: theme.spacing.xs, textAlign: 'center', minWidth: 150 },
    profileEmail: { fontSize: theme.fontSize.base, color: theme.colors.text_secondary, marginTop: theme.spacing.xs },
    section: { marginTop: theme.spacing.sm, marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md },
    sectionTitle: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.text_secondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionContent: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, overflow: 'hidden' },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.background },
    lastItem: { borderBottomWidth: 0 },
    settingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    settingTitle: { flex: 1, fontSize: theme.fontSize.base, color: theme.colors.text_primary },
    disabledText: { color: theme.colors.text_secondary },
    settingAction: { justifyContent: 'center' },
    logoutItem: { backgroundColor: '#FEF2F2' },
    logoutIcon: { backgroundColor: '#FEE2E2' },
    logoutText: { color: '#EF4444', fontWeight: '600' },
    imageModalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
    fullScreenImage: { width: '100%', height: '80%', resizeMode: 'contain' },
    closeButton: { position: 'absolute', top: 60, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    pinModalContainer: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg },
    exportModalContainer: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, alignItems: 'center' },
    modalTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text_primary, marginTop: theme.spacing.md, marginBottom: theme.spacing.md, textAlign: 'center' },
    modalDescription: { fontSize: theme.fontSize.base, color: theme.colors.text_secondary, textAlign: 'center', marginBottom: theme.spacing.lg, lineHeight: 22 },
    exportInfoBox: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, width: '100%', marginBottom: theme.spacing.lg },
    exportInfoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.spacing.xs },
    exportInfoText: { fontSize: theme.fontSize.sm, color: theme.colors.text_primary, marginLeft: theme.spacing.sm },
    modalInput: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, color: theme.colors.text_primary, fontSize: theme.fontSize.base },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md, width: '100%' },
    modalButtonCancel: { backgroundColor: '#6B7280', paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md, flex: 1, marginRight: theme.spacing.sm, alignItems: 'center' },
    modalButtonSave: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md, flex: 1, marginLeft: theme.spacing.sm, alignItems: 'center' },
    modalButtonConfirm: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md, flex: 1, marginLeft: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    modalButtonText: { color: theme.colors.white, fontWeight: '600', textAlign: 'center', fontSize: theme.fontSize.base },
});
