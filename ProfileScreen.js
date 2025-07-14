import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import CustomButton from '../components/CustomButton';

export default function ProfileScreen({ navigation }) {
    const { userName, setUserName, profileImage, setProfileImage } = useUser();
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [tempUserName, setTempUserName] = useState(userName);

    const handleSaveChanges = () => {
        setUserName(tempUserName);
        Alert.alert("Success", "Your profile has been updated.");
        navigation.goBack();
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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={() => profileImage && setImageModalVisible(true)}>
                    <Image
                        source={profileImage ? { uri: profileImage } : { uri: 'https://placehold.co/150x150/161B22/E6EDF3?text=Add+Photo' }}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraButton} onPress={handleChangeProfilePicture}>
                    <Ionicons name="camera-reverse-outline" size={24} color={theme.colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Display Name</Text>
                    <TextInput
                        style={styles.input}
                        value={tempUserName}
                        onChangeText={setTempUserName}
                        placeholder="Enter your name"
                        placeholderTextColor={theme.colors.text_secondary}
                    />
                </View>
                <CustomButton title="Save Changes" onPress={handleSaveChanges} style={{ marginTop: theme.spacing.lg }}/>
            </View>

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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: theme.spacing.xl,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: theme.colors.primary,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: theme.colors.primary,
        padding: 10,
        borderRadius: 20,
    },
    form: {
        paddingHorizontal: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        color: theme.colors.text_secondary,
        marginBottom: theme.spacing.sm,
        fontSize: 14,
    },
    input: {
        backgroundColor: theme.colors.surface,
        color: theme.colors.text_primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        fontSize: 16,
    },
    imageModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 20,
    },
});
