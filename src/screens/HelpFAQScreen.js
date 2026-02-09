import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../styles/theme';

const FAQ_DATA = [
    {
        category: 'Getting Started',
        icon: 'rocket-outline',
        questions: [
            {
                q: 'How do I add my first transaction?',
                a: 'Tap the "+" button on the Transactions tab. Select Income or Expense, fill in the amount, title, and category, then tap Save Transaction.',
            },
            {
                q: 'What is the Dashboard?',
                a: 'The Dashboard shows your financial overview including total balance, recent transactions, spending by category, and budget status at a glance.',
            },
            {
                q: 'How do I set up my profile?',
                a: 'Go to Settings → tap your profile picture to change it, and tap your name to edit it. Changes are saved automatically.',
            },
        ],
    },
    {
        category: 'Transactions',
        icon: 'swap-horizontal-outline',
        questions: [
            {
                q: 'How do I edit a transaction?',
                a: 'Go to the Transactions tab, tap on any transaction to view details, then tap the Edit icon. Make your changes and save.',
            },
            {
                q: 'How do I delete a transaction?',
                a: 'Open the transaction details by tapping on it, then tap the Delete icon (trash). Confirm the deletion when prompted.',
            },
            {
                q: 'What\'s the difference between Income and Expense?',
                a: 'Income increases your balance (salary, gifts, etc.), while Expenses decrease it (food, shopping, etc.). Choose the correct type when adding transactions.',
            },
            {
                q: 'Can I add transactions from the past?',
                a: 'Yes! When adding a transaction, tap the date field to select any date. You can add historical transactions.',
            },
        ],
    },
    {
        category: 'Budget Management',
        icon: 'wallet-outline',
        questions: [
            {
                q: 'How do I set a budget?',
                a: 'Go to the Budget tab, tap the "+" button or edit an existing category. Enter your monthly budget amount and save.',
            },
            {
                q: 'What happens when I exceed my budget?',
                a: 'The app will show a warning indicator on that category. You\'ll see a red progress bar indicating you\'ve gone over budget.',
            },
            {
                q: 'Can I set different budgets for different categories?',
                a: 'Yes! Each expense category (Food, Transport, etc.) can have its own budget limit. Set them individually in the Budget tab.',
            },
            {
                q: 'Are budgets monthly or yearly?',
                a: 'Budgets are monthly by default. They reset automatically at the start of each month.',
            },
        ],
    },
    {
        category: 'SMS Auto-Import',
        icon: 'chatbubble-ellipses-outline',
        questions: [
            {
                q: 'How does SMS auto-import work?',
                a: 'The app reads SMS messages from your bank to automatically detect and import transactions. You can review and confirm them before adding.',
            },
            {
                q: 'Which banks are supported?',
                a: 'Most major Sri Lankan banks are supported including Commercial Bank, Sampath, HNB, BOC, and NDB. The app detects transaction patterns automatically.',
            },
            {
                q: 'How do I enable SMS detection?',
                a: 'Go to Settings → SMS Detection toggle. Grant SMS permission when prompted. New transactions will be detected automatically.',
            },
            {
                q: 'Is my SMS data safe?',
                a: 'Yes! SMS data is processed locally on your device only. Only transaction-related messages are read, and no data is sent to external servers.',
            },
        ],
    },
    {
        category: 'Security & Privacy',
        icon: 'shield-checkmark-outline',
        questions: [
            {
                q: 'How do I enable biometric login?',
                a: 'Go to Settings → Biometric Login toggle. If your device supports fingerprint or Face ID, you can use it to unlock the app.',
            },
            {
                q: 'How do I change my PIN?',
                a: 'Go to Settings → Change PIN. Enter your current PIN, then your new PIN twice to confirm.',
            },
            {
                q: 'Is my financial data secure?',
                a: 'Yes! All data is encrypted and stored in Firebase Cloud Firestore with strict security rules. Only you can access your data.',
            },
            {
                q: 'Can I export my data?',
                a: 'Yes! Go to Settings → Export Data. You\'ll receive a CSV file with all your transactions that you can view in Excel or Google Sheets.',
            },
        ],
    },
    {
        category: 'Data Management',
        icon: 'server-outline',
        questions: [
            {
                q: 'How do I export my transactions?',
                a: 'Go to Settings → Export Data. Confirm the export, and a CSV file will be generated with all your transactions. You can share or save this file.',
            },
            {
                q: 'What happens if I clear my data?',
                a: 'Clearing data permanently deletes ALL transactions from your account. Your budgets and settings remain intact. This action cannot be undone.',
            },
            {
                q: 'Is there a transaction limit?',
                a: 'No! You can add unlimited transactions. All data is synced to the cloud automatically.',
            },
        ],
    },
    {
        category: 'Troubleshooting',
        icon: 'construct-outline',
        questions: [
            {
                q: 'Transactions not saving?',
                a: 'Check your internet connection. Ensure you\'re logged in. If the issue persists, try logging out and back in.',
            },
            {
                q: 'Budget not updating?',
                a: 'Make sure transactions are categorized correctly. Budgets only track Expense transactions, not Income.',
            },
            {
                q: 'SMS detection not working?',
                a: 'Ensure SMS Detection is enabled in Settings and you\'ve granted SMS permission. Check that incoming messages are from your bank.',
            },
            {
                q: 'App is slow or crashes?',
                a: 'Try clearing the app cache. Go to Settings → Clear Data (warning: this deletes transactions). Or restart the app.',
            },
        ],
    },
];

export default function HelpFAQScreen() {
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpanded = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Ionicons name="help-circle" size={48} color={theme.colors.primary} />
                <Text style={styles.headerTitle}>Help & FAQ</Text>
                <Text style={styles.headerSubtitle}>
                    Find answers to common questions about using Finance Tracker
                </Text>
            </View>

            {FAQ_DATA.map((category, categoryIndex) => (
                <View key={categoryIndex} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                        <Ionicons name={category.icon} size={24} color={theme.colors.primary} />
                        <Text style={styles.categoryTitle}>{category.category}</Text>
                    </View>

                    {category.questions.map((item, questionIndex) => {
                        const key = `${categoryIndex}-${questionIndex}`;
                        const isExpanded = expandedItems[key];

                        return (
                            <TouchableOpacity
                                key={questionIndex}
                                style={styles.faqItem}
                                onPress={() => toggleExpanded(categoryIndex, questionIndex)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.questionRow}>
                                    <Text style={styles.question}>{item.q}</Text>
                                    <Ionicons
                                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={theme.colors.text_secondary}
                                    />
                                </View>
                                {isExpanded && (
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answer}>{item.a}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            <View style={styles.footer}>
                <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.footerText}>
                    Still need help? Contact us at{' '}
                    <Text style={styles.footerEmail}>support@financetracker.app</Text>
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.md,
    },
    headerTitle: {
        fontSize: theme.fontSize.xxl,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
        marginTop: theme.spacing.md,
    },
    headerSubtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.text_secondary,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
    },
    categorySection: {
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
    },
    categoryTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
        marginLeft: theme.spacing.sm,
    },
    faqItem: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    questionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_primary,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    answerContainer: {
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray[700],
    },
    answer: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_secondary,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
    },
    footerText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text_secondary,
        marginLeft: theme.spacing.md,
        flex: 1,
    },
    footerEmail: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
});
