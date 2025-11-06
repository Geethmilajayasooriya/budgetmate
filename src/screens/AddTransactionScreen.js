import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import CategoryPicker from '../components/CategoryPicker';

export default function AddTransactionScreen({ navigation, route }) {
    // Check for parameters passed from the route (e.g., from the scanner)
    const params = route.params || {};
    
    const [amount, setAmount] = useState(params.amount || "");
    const [title, setTitle] = useState(params.title || "");
    const [category, setCategory] = useState(params.category || "");
    const [type, setType] = useState('expense');
    const [note, setNote] = useState(params.note || "");

    // This hook updates the form fields if the user scans another receipt
    // while this screen is already open.
    useEffect(() => {
        if (route.params) {
            if (route.params.amount) setAmount(route.params.amount);
            if (route.params.title) setTitle(route.params.title);
            if (route.params.category) setCategory(route.params.category);
            if (route.params.note) setNote(route.params.note);
        }
    }, [route.params]);


    const handleSaveTransaction = () => {
        if (!amount || !title || !category) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        Alert.alert(
            'Success',
            'Transaction added successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
                {/* Transaction Type Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transaction Type</Text>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === 'expense' && styles.activeExpenseButton,
                            ]}
                            onPress={() => setType('expense')}
                        >
                            <Ionicons
                                name="arrow-down"
                                size={20}
                                color={type === 'expense' ? theme.colors.white : theme.colors.danger}
                            />
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    type === 'expense' && styles.activeTypeButtonText,
                                ]}
                            >
                                Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === 'income' && styles.activeIncomeButton,
                            ]}
                            onPress={() => setType('income')}
                        >
                            <Ionicons
                                name="arrow-up"
                                size={20}
                                color={type === 'income' ? theme.colors.white : theme.colors.success}
                            />
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    type === 'income' && styles.activeTypeButtonText,
                                ]}
                            >
                                Income
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amount *</Text>
                    <View style={styles.amountContainer}>
                        <Text style={styles.currencySymbol}>Rs.</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Title Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter transaction title"
                    />
                </View>

                {/* Category Picker */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Category *</Text>
                    <CategoryPicker
                        selectedCategory={category}
                        onSelectCategory={setCategory}
                        type={type}
                    />
                </View>

                {/* Note Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Note (Full Scanned Text)</Text>
                    <TextInput
                        style={[styles.input, styles.noteInput]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Scanned text will appear here..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveTransaction}>
                    <Text style={styles.saveButtonText}>Save Transaction</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.md,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_secondary,
        marginBottom: theme.spacing.sm,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.gray[700],
        gap: theme.spacing.sm,
    },
    activeExpenseButton: {
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
    },
    activeIncomeButton: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    typeButtonText: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_secondary,
    },
    activeTypeButtonText: {
        color: theme.colors.white,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.gray[400],
        marginRight: theme.spacing.sm,
    },
    amountInput: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.base,
        color: theme.colors.text_primary,
    },
    noteInput: {
        height: 120,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    saveButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
    },
});
