import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import BudgetCard from '../components/BudgetCard';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';

// Animated component for staggered entry
const AnimatedView = ({ children, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    React.useEffect(() => {
        opacity.value = withDelay(index * 150, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
        translateY.value = withDelay(index * 150, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
    }, []);

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};


export default function BudgetScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [newBudgetCategory, setNewBudgetCategory] = useState("");
    const [newBudgetAmount, setNewBudgetAmount] = useState("");

    const budgets = [
        { id: 1, category: 'Food & Dining', spent: 8500, budget: 12000, icon: 'restaurant' },
        { id: 2, category: 'Transportation', spent: 4200, budget: 6000, icon: 'car' },
        { id: 3, category: 'Utilities', spent: 3200, budget: 4000, icon: 'flash' },
        { id: 4, category: 'Shopping', spent: 5800, budget: 5000, icon: 'bag' },
    ];

    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);

    const handleAddBudget = () => {
        if (!newBudgetCategory || !newBudgetAmount) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        Alert.alert('Success', 'Budget category added successfully!');
        setModalVisible(false);
        setNewBudgetCategory("");
        setNewBudgetAmount("");
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {/* Overall Budget Summary */}
                <AnimatedView index={0}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Monthly Budget Overview</Text>
                        <View style={styles.summaryDetails}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Budget</Text>
                                <Text style={styles.summaryAmount}>Rs. {totalBudget.toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Spent</Text>
                                <Text style={[styles.summaryAmount, { color: theme.colors.danger }]}>
                                    Rs. {totalSpent.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                        <BudgetCard spent={totalSpent} budget={totalBudget} />
                    </View>
                </AnimatedView>

                {/* Budget Categories */}
                <AnimatedView index={1}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Budget Categories</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setModalVisible(true)}
                            >
                                <Ionicons name="add" size={20} color={theme.colors.primary} />
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                        {budgets.map((budget) => (
                            <View key={budget.id} style={styles.budgetItem}>
                                <View style={styles.budgetHeader}>
                                    <View style={styles.budgetIconContainer}>
                                        <Ionicons name={budget.icon} size={24} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.budgetInfo}>
                                        <Text style={styles.budgetCategory}>{budget.category}</Text>
                                        <Text style={styles.budgetAmounts}>
                                            Rs. {budget.spent.toLocaleString()} / Rs. {budget.budget.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                                <BudgetCard
                                    spent={budget.spent}
                                    budget={budget.budget}
                                    showTitle={false}
                                    compact={true}
                                />
                            </View>
                        ))}
                    </View>
                </AnimatedView>
            </ScrollView>

            {/* Add Budget Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Budget Category</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.text_secondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Category Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newBudgetCategory}
                                onChangeText={setNewBudgetCategory}
                                placeholder="e.g., Groceries, Gas, etc."
                                placeholderTextColor={theme.colors.text_secondary}
                            />
                            <Text style={styles.inputLabel}>Budget Amount</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newBudgetAmount}
                                onChangeText={setNewBudgetAmount}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.text_secondary}
                            />
                        </View>
                        <TouchableOpacity style={styles.saveButton} onPress={handleAddBudget}>
                            <Text style={styles.saveButtonText}>Add Budget</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContainer: {
        padding: theme.spacing.md,
    },
    summaryCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.xl,
    },
    summaryTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
        marginBottom: theme.spacing.lg,
    },
    summaryDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    summaryItem: {
        alignItems: 'flex-start',
    },
    summaryLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_secondary,
        marginBottom: theme.spacing.xs,
    },
    summaryAmount: {
        fontSize: theme.fontSize.xl,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    addButtonText: {
        color: theme.colors.primary,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
    budgetItem: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    budgetIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    budgetInfo: {
        flex: 1,
    },
    budgetCategory: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_primary,
    },
    budgetAmounts: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_secondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
    },
    modalBody: {
        marginBottom: theme.spacing.lg,
    },
    inputLabel: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_secondary,
        marginBottom: theme.spacing.sm,
    },
    modalInput: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.base,
        color: theme.colors.text_primary,
        marginBottom: theme.spacing.md,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    saveButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.base,
        fontWeight: 'bold',
    },
});
