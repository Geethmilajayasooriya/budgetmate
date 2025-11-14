import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { deleteTransaction } from '../services/firebaseService';
import { theme } from '../styles/theme';

export default function TransactionDetailScreen({ route, navigation }) {
    const { transaction } = route.params;
    const [loading, setLoading] = useState(false);

    if (!transaction) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Transaction not found</Text>
            </View>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteTransaction(transaction.id);
                            Alert.alert('Success', 'Transaction deleted successfully', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error deleting transaction:', error);
                            Alert.alert('Error', 'Failed to delete transaction. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        navigation.navigate('AddTransaction', { 
            transaction: transaction,
            mode: 'edit' 
        });
    };

    // Parse date
    let displayDate = 'N/A';
    try {
        if (transaction.date) {
            displayDate = new Date(transaction.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (transaction.createdAt?.toDate) {
            displayDate = transaction.createdAt.toDate().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    } catch (error) {
        console.error('Error parsing date:', error);
    }

    const categoryIcons = {
        'food': 'restaurant',
        'transport': 'car',
        'utilities': 'flash',
        'shopping': 'bag',
        'entertainment': 'game-controller',
        'health': 'medical',
        'education': 'school',
        'salary': 'briefcase',
        'freelance': 'laptop',
        'business': 'storefront',
        'investment': 'trending-up',
        'gift': 'gift',
        'other': 'ellipsis-horizontal',
    };

    const categoryNames = {
        'food': 'Food & Dining',
        'transport': 'Transportation',
        'utilities': 'Utilities',
        'shopping': 'Shopping',
        'entertainment': 'Entertainment',
        'health': 'Healthcare',
        'education': 'Education',
        'salary': 'Salary',
        'freelance': 'Freelance',
        'business': 'Business',
        'investment': 'Investment',
        'gift': 'Gift',
        'other': 'Other',
    };

    const isIncome = transaction.type === 'income' || transaction.amount > 0;
    const displayAmount = Math.abs(transaction.amount);
    const categoryIcon = categoryIcons[transaction.category] || 'ellipsis-horizontal';
    const categoryName = categoryNames[transaction.category] || transaction.category;

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Amount Section */}
            <View style={styles.amountSection}>
                <View style={[
                    styles.amountBadge,
                    { backgroundColor: isIncome ? theme.colors.success + '20' : theme.colors.danger + '20' }
                ]}>
                    <Text style={[
                        styles.amountText,
                        { color: isIncome ? theme.colors.success : theme.colors.danger }
                    ]}>
                        {isIncome ? '+' : '-'}Rs. {displayAmount.toLocaleString()}
                    </Text>
                </View>
                <Text style={styles.titleText}>{transaction.title || 'Untitled Transaction'}</Text>
            </View>

            {/* Details Card */}
            <View style={styles.detailsCard}>
                {/* Category */}
                <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                        <Ionicons name="pricetag" size={20} color={theme.colors.text_secondary} />
                        <Text style={styles.detailLabelText}>Category</Text>
                    </View>
                    <View style={styles.categoryBadge}>
                        <Ionicons name={categoryIcon} size={16} color={theme.colors.primary} />
                        <Text style={styles.categoryText}>{categoryName}</Text>
                    </View>
                </View>

                {/* Type */}
                <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                        <Ionicons 
                            name={isIncome ? 'arrow-down-circle' : 'arrow-up-circle'} 
                            size={20} 
                            color={theme.colors.text_secondary} 
                        />
                        <Text style={styles.detailLabelText}>Type</Text>
                    </View>
                    <View style={[
                        styles.typeBadge,
                        { backgroundColor: isIncome ? theme.colors.success + '20' : theme.colors.danger + '20' }
                    ]}>
                        <Text style={[
                            styles.typeText,
                            { color: isIncome ? theme.colors.success : theme.colors.danger }
                        ]}>
                            {isIncome ? 'Income' : 'Expense'}
                        </Text>
                    </View>
                </View>

                {/* Date */}
                <View style={styles.detailRow}>
                    <View style={styles.detailLabel}>
                        <Ionicons name="calendar" size={20} color={theme.colors.text_secondary} />
                        <Text style={styles.detailLabelText}>Date</Text>
                    </View>
                    <Text style={styles.detailValue}>{displayDate}</Text>
                </View>

                {/* Note */}
                {transaction.note && (
                    <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
                        <View style={styles.detailLabel}>
                            <Ionicons name="document-text" size={20} color={theme.colors.text_secondary} />
                            <Text style={styles.detailLabelText}>Note</Text>
                        </View>
                        <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>
                            {transaction.note}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={handleEdit}
                    activeOpacity={0.7}
                >
                    <Ionicons name="create-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>

            {/* Transaction ID Info */}
            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color={theme.colors.text_secondary} />
                <Text style={styles.infoText}>Transaction ID: {transaction.id}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    errorText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.danger,
    },
    amountSection: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        marginBottom: theme.spacing.lg,
    },
    amountBadge: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        marginBottom: theme.spacing.md,
    },
    amountText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    titleText: {
        fontSize: theme.fontSize.xl,
        fontWeight: '600',
        color: theme.colors.text_primary,
        textAlign: 'center',
    },
    detailsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray[700],
    },
    detailLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    detailLabelText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.text_secondary,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: theme.fontSize.base,
        color: theme.colors.text_primary,
        fontWeight: '500',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
    },
    categoryText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_primary,
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
    },
    typeText: {
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.xs,
    },
    editButton: {
        backgroundColor: theme.colors.primary,
    },
    deleteButton: {
        backgroundColor: theme.colors.danger,
    },
    actionButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
    },
    infoText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_secondary,
        flex: 1,
    },
});
