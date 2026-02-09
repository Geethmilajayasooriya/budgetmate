import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { theme } from '../styles/theme';

const faqData = [
    {
        category: 'Getting Started',
        questions: [
            {
                q: 'How do I add my first transaction?',
                a: 'Tap the "+" button on the Transactions screen or use the "Add" quick action on the Dashboard. Fill in the amount, title, and category, then tap "Save Transaction".',
            },
            {
                q: 'How do I set up budgets?',
                a: 'Go to the Budget tab and tap "Add" to create a new budget category. Enter the category name and monthly budget amount. Default budgets are created automatically when you first log in.',
            },
            {
                q: 'Can I scan receipts?',
                a: 'Yes! Tap the "Scan" quick action on the Dashboard or use the camera icon in the Transactions screen. The app uses AI to extract transaction details from your receipts.',
            },
        ],
    },
    {
        category: 'Transactions',
        questions: [
            {
                q: 'How do I edit a transaction?',
                a: 'Tap on any transaction in the list to view details, then tap the "Edit" button. Make your changes and tap "Save Changes".',
            },
            {
                q: 'How do I delete a transaction?',
                a: 'Open the transaction details by tapping on it, then tap the "Delete" button. Confirm the deletion when prompted. This action cannot be undone.',
            },
            {
                q: 'What\'s the difference between income and expense?',
                a: 'Income adds to your balance (salary, business income, gifts), while expenses subtract from it (food, transport, bills). Choose the correct type when adding transactions.',
            },
        ],
    },
    {
        category: 'Budgets & Reports',
        questions: [
            {
                q: 'How are budgets calculated?',
                a: 'Budgets are monthly limits for spending categories. The app tracks your expenses against these limits and sends notifications at 75%, 90%, and 100% usage.',
            },
            {
                q: 'What do the reports show?',
                a: 'Reports display your financial trends with charts showing income vs. expenses, category breakdowns, and savings analysis. You can view weekly or monthly reports.',
            },
            {
                q: 'How do I export my data?',
                a: 'Go to Settings > Data Management > Export Data. Your transactions will be exported as a CSV file that you can open in Excel or Google Sheets.',
            },
        ],
    },
    {
        category: 'Security & Privacy',
        questions: [
            {
                q: 'Is my data secure?',
                a: 'Yes! Your data is stored in Firebase with industry-standard encryption. Only you can access your financial information using your secure login credentials.',
            },
            {
                q: 'How do I enable biometric login?',
                a: 'Go to Settings > Security > Biometric Login and toggle it on. You\'ll need to authenticate once to enable this feature. Make sure your device has fingerprint or Face ID set up.',
            },
            {
                q: 'Can I change my PIN?',
                a: 'Yes! Go to Settings > Security > Change PIN. Enter your current PIN, then your new PIN twice to confirm.',
            },
        ],
    },
    {
        category: 'Troubleshooting',
        questions: [
            {
                q: 'The app says "No Internet Connection"',
                a: 'Check your WiFi or mobile data connection. Most features require an internet connection to sync with the cloud. Reconnect and try again.',
            },
            {
                q: 'My transactions aren\'t showing up',
                a: 'Pull down on the transaction list to refresh. If still not showing, check your internet connection and make sure you\'re logged into the correct account.',
            },
            {
                q: 'Receipt scanning isn\'t working',
                a: 'Make sure you\'ve granted camera permissions to the app. Ensure the receipt is well-lit and clearly visible. If the issue persists, try manually entering the transaction.',
            },
            {
                q: 'How do I recover deleted transactions?',
                a: 'Unfortunately, deleted transactions cannot be recovered. We recommend exporting your data regularly as a backup.',
            },
        ],
    },
];

export default function HelpFAQScreen() {
    const [expandedItems, setExpandedItems] = useState({});

    const toggleItem = (category, index) => {
        const key = `${category}-${index}`;
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleContactSupport = async () => {
        const email = 'support@financetracker.app';
        const subject = 'Support Request - Finance Tracker';
        const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        
        try {
            const supported = await Linking.canOpenURL(mailto);
            if (supported) {
                await Linking.openURL(mailto);
            }
        } catch (error) {
            console.error('Error opening email:', error);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="help-circle" size={48} color={theme.colors.primary} />
                <Text style={styles.headerTitle}>Help & FAQ</Text>
                <Text style={styles.headerSubtitle}>
                    Find answers to common questions
                </Text>
            </View>

            {/* FAQ Sections */}
            {faqData.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons 
                            name="folder-open" 
                            size={20} 
                            color={theme.colors.primary} 
                        />
                        <Text style={styles.sectionTitle}>{section.category}</Text>
                    </View>

                    {section.questions.map((item, itemIndex) => {
                        const key = `${section.category}-${itemIndex}`;
                        const isExpanded = expandedItems[key];

                        return (
                            <TouchableOpacity
                                key={itemIndex}
                                style={styles.faqItem}
                                onPress={() => toggleItem(section.category, itemIndex)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.questionRow}>
                                    <Text style={styles.questionText}>{item.q}</Text>
                                    <Ionicons
                                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                </View>
                                {isExpanded && (
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answerText}>{item.a}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            {/* Contact Support Card */}
            <View style={styles.supportCard}>
                <Ionicons name="chatbubbles" size={32} color={theme.colors.primary} />
                <Text style={styles.supportTitle}>Still need help?</Text>
                <Text style={styles.supportText}>
                    Our support team is here to assist you with any questions or issues.
                </Text>
                <TouchableOpacity 
                    style={styles.supportButton}
                    onPress={handleContactSupport}
                    activeOpacity={0.7}
                >
                    <Ionicons name="mail" size={20} color={theme.colors.white} />
                    <Text style={styles.supportButtonText}>Contact Support</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Tips */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
                <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.tipText}>
                        Regularly export your data as backup
                    </Text>
                </View>
                <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.tipText}>
                        Set realistic budgets based on your spending habits
                    </Text>
                </View>
                <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.tipText}>
                        Review your weekly reports to track progress
                    </Text>
                </View>
                <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.tipText}>
                        Use categories consistently for better insights
                    </Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
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
        fontSize: theme.fontSize['2xl'],
        fontWeight: 'bold',
        color: theme.colors.text_primary,
        marginTop: theme.spacing.md,
    },
    headerSubtitle: {
        fontSize: theme.fontSize.base,
        color: theme.colors.text_secondary,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    section: {
        marginBottom: theme.spacing.lg,
        marginHorizontal: theme.spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xs,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
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
        alignItems: 'flex-start',
    },
    questionText: {
        flex: 1,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
        color: theme.colors.text_primary,
        marginRight: theme.spacing.sm,
    },
    answerContainer: {
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.background,
    },
    answerText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.text_secondary,
        lineHeight: 22,
    },
    supportCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
        alignItems: 'center',
    },
    supportTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
        marginTop: theme.spacing.md,
    },
    supportText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.text_secondary,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
    },
    supportButtonText: {
        color: theme.colors.white,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
    tipsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
    },
    tipsTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.text_primary,
        marginBottom: theme.spacing.md,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    tipText: {
        flex: 1,
        fontSize: theme.fontSize.base,
        color: theme.colors.text_secondary,
        lineHeight: 22,
    },
});