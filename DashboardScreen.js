import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import BudgetCard from '../components/BudgetCard';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';
import { useUser } from '../context/UserContext';
import * as Haptics from 'expo-haptics';
import AnimatedView from '../components/AnimatedView'; // Assuming this is in a separate file
import AnimatedPressable from '../components/AnimatedPressable'; // Import the new component

export default function DashboardScreen({ navigation }) {
    const { userName, profileImage } = useUser();
    const currentBalance = 45750.00;
    const monthlySpending = 12850.00;
    const monthlyBudget = 15000.00;
    const recentTransactions = [
        { id: 1, title: 'Grocery Shopping', amount: -2500, category: 'Food', date: '2025-06-29' },
        { id: 2, title: 'Salary', amount: 50000, category: 'Income', date: '2025-06-28' },
        { id: 3, title: 'Electricity Bill', amount: -3200, category: 'Utilities', date: '2025-06-27' },
        { id: 4, title: 'Coffee Run', amount: -500, category: 'Food', date: '2025-06-26' },
    ];
    const quickActions = [
        { icon: 'add-circle', title: 'Add', action: () => navigation.navigate('Transactions', { screen: 'AddTransaction' }) },
        { icon: 'camera', title: 'Scan', action: () => navigation.navigate('Transactions', { screen: 'ScanReceipt' }) },
        { icon: 'card', title: 'Cards', action: () => navigation.navigate('CardsStack') },
        { icon: 'analytics', title: 'Reports', action: () => navigation.navigate('Reports') },
    ];

    const handleQuickActionPress = (action) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        action();
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />
            
            <AnimatedView index={0}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerWelcome}>Welcome Back,</Text>
                        <Text style={styles.headerUser}>{userName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Image
                            source={profileImage ? { uri: profileImage } : { uri: 'https://placehold.co/100x100/1f2937/f9fafb?text=U' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </AnimatedView>

            <AnimatedView index={1}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Current Balance</Text>
                    <Text style={styles.balanceAmount}>Rs. {currentBalance.toLocaleString()}</Text>
                </View>
            </AnimatedView>

            <AnimatedView index={2}>
                 <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsContainer}>
                        {quickActions.map((action) => (
                            // Use the new AnimatedPressable component here
                            <AnimatedPressable
                                key={action.title}
                                style={styles.quickActionItem}
                                onPress={() => handleQuickActionPress(action.action)}
                            >
                                <View style={styles.quickActionIcon}>
                                    <Ionicons name={action.icon} size={26} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.quickActionText}>{action.title}</Text>
                            </AnimatedPressable>
                        ))}
                    </ScrollView>
                </View>
            </AnimatedView>

            <AnimatedView index={3}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>This Month's Budget</Text>
                    <BudgetCard
                        spent={monthlySpending}
                        budget={monthlyBudget}
                    />
                </View>
            </AnimatedView>

            <AnimatedView index={4}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
                    </View>
                    {recentTransactions.map((transaction) => (
                        <View key={transaction.id} style={styles.transactionItem}>
                            <View style={styles.transactionIcon}><Ionicons name={transaction.amount > 0 ? 'arrow-up-circle' : 'arrow-down-circle'} size={30} color={transaction.amount > 0 ? theme.colors.success : theme.colors.danger} /></View>
                            <View style={styles.transactionDetails}>
                                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                                <Text style={styles.transactionCategory}>{transaction.category}</Text>
                            </View>
                            <View style={styles.transactionAmount}>
                                <Text style={[styles.transactionAmountText, { color: transaction.amount > 0 ? theme.colors.success : theme.colors.danger }]}>{transaction.amount > 0 ? '+' : '-'}Rs. {Math.abs(transaction.amount).toLocaleString()}</Text>
                                <Text style={styles.transactionDate}>{transaction.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </AnimatedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.sm },
    headerWelcome: { fontSize: theme.fontSize.base, color: theme.colors.text_secondary },
    headerUser: { fontSize: theme.fontSize['2xl'], color: theme.colors.text_primary, fontWeight: 'bold' },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    balanceCard: { backgroundColor: theme.colors.primary, marginHorizontal: theme.spacing.md, padding: theme.spacing.lg, borderRadius: theme.borderRadius.xl },
    balanceLabel: { color: 'rgba(255, 255, 255, 0.8)', fontSize: theme.fontSize.base, marginBottom: theme.spacing.sm },
    balanceAmount: { color: theme.colors.white, fontSize: 36, fontWeight: 'bold' },
    section: { marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.md },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
    sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text_primary },
    seeAllText: { color: theme.colors.primary, fontSize: theme.fontSize.base, fontWeight: '600' },
    quickActionsContainer: { paddingVertical: theme.spacing.sm },
    quickActionItem: { alignItems: 'center', marginRight: theme.spacing.lg },
    quickActionIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
    quickActionText: { fontSize: theme.fontSize.sm, color: theme.colors.text_secondary, fontWeight: '500' },
    transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.sm },
    transactionIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    transactionDetails: { flex: 1 },
    transactionTitle: { fontSize: theme.fontSize.base, fontWeight: '600', color: theme.colors.text_primary },
    transactionCategory: { fontSize: theme.fontSize.sm, color: theme.colors.text_secondary },
    transactionAmount: { alignItems: 'flex-end' },
    transactionAmountText: { fontSize: theme.fontSize.base, fontWeight: 'bold' },
    transactionDate: { fontSize: theme.fontSize.sm, color: theme.colors.text_secondary },
});
