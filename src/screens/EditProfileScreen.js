import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { theme } from '../styles/theme';

export default function EditProfileScreen({ navigation }) {
    const { userName, setUserName, profileImage, setProfileImage } = useUser();
    const [name, setName] = useState(userName);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant photo library access to change profile picture');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                await setProfileImage(result.assets[0].uri);
                Alert.alert('Success', 'Profile picture updated!');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setLoading(true);
        try {
            await setUserName(name.trim());
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Profile Picture Section */}
                <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={
                                profileImage
                                    ? { uri: profileImage }
                                    : { uri: 'https://placehold.co/200x200/1f2937/f9fafb?text=U' }
                            }
                            style={styles.profileImage}
                        />
                        <TouchableOpacity
                            style={styles.changeImageButton}
                            onPress={pickImage}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="camera" size={20} color={theme.colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.imageHint}>Tap the camera icon to change photo</Text>
                </View>

                {/* Name Input Section */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Display Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={theme.colors.text_secondary}
                        maxLength={50}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color={theme.colors.info} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Profile Information</Text>
                        <Text style={styles.infoText}>
                            Your name will be displayed on the Dashboard and throughout the app.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContainer: {
        padding: theme.spacing.lg,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.lg,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: theme.spacing.md,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: theme.colors.primary,
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    imageHint: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_secondary,
        marginTop: theme.spacing.sm,
    },
    inputSection: {
        marginBottom: theme.spacing.xl,
    },
    label: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_primary,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.base,
        color: theme.colors.text_primary,
        borderWidth: 1,
        borderColor: theme.colors.gray[700],
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.base,
        fontWeight: 'bold',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.info,
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    infoTitle: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_primary,
        marginBottom: 4,
    },
    infoText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_secondary,
        lineHeight: 20,
    },
});
