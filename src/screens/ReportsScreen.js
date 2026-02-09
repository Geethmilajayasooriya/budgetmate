// ReportsScreen.js - Interactive Chart with Clickable Bars
// Tap any bar to see the exact amount!

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { auth, db } from '../../firebase';
import { theme } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category configuration
const CATEGORY_CONFIG = {
    food: { name: 'Food & Dining', icon: 'restaurant', color: '#10b981' },
    transport: { name: 'Transportation', icon: 'car', color: '#f59e0b' },
    shopping: { name: 'Shopping', icon: 'bag', color: '#ef4444' },
    utilities: { name: 'Bills & Utilities', icon: 'flash', color: '#3b82f6' },
    entertainment: { name: 'Entertainment', icon: 'game-controller', color: '#8b5cf6' },
    health: { name: 'Healthcare', icon: 'medical', color: '#ec4899' },
    education: { name: 'Education', icon: 'school', color: '#14b8a6' },
    other: { name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
};

// Date helper functions
const getISOWeekBounds = (weekOffset = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    let diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    diffToMonday += (weekOffset * 7);
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
};

const getMonthBounds = (monthOffset = 0) => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    
    const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    
    const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    return { start: firstDay, end: lastDay };
};

const formatWeekRange = (start, end) => {
    const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    return `${formatDate(start)} – ${formatDate(end)}, ${start.getFullYear()}`;
};

const formatMonthRange = (start) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[start.getMonth()]} ${start.getFullYear()}`;
};

const AnimatedCard = ({ children, delay = 0, style }) => {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(600).springify()}
            style={[styles.card, style]}
        >
            {children}
        </Animated.View>
    );
};

export default function ReportsScreen({ navigation }) {
    const [viewMode, setViewMode] = useState('weekly');
    const [timeOffset, setTimeOffset] = useState(0);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBar, setSelectedBar] = useState(null); // Track which bar is tapped
    
    useEffect(() => {
        loadData();
    }, [timeOffset, viewMode]);

    const loadData = async () => {
        setLoading(true);
        try {
            const bounds = viewMode === 'weekly' 
                ? getISOWeekBounds(timeOffset) 
                : getMonthBounds(timeOffset);
            
            const { start, end } = bounds;
            const userId = auth.currentUser?.uid;
            
            if (!userId) throw new Error('User not authenticated');
            
            const transactionsRef = collection(db, 'users', userId, 'transactions');
            const q = query(
                transactionsRef,
                where('createdAt', '>=', Timestamp.fromDate(start)),
                where('createdAt', '<=', Timestamp.fromDate(end))
            );
            
            const querySnapshot = await getDocs(q);
            const txnData = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                txnData.push({
                    id: doc.id,
                    ...data,
                    date: data.createdAt?.toDate?.() || new Date(data.date),
                });
            });
            
            setTransactions(txnData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return {
            income,
            expenses,
            balance: income - expenses,
        };
    }, [transactions]);

    // Category breakdown
    const categoryData = useMemo(() => {
        const categoryTotals = {};
        
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const cat = t.category || 'other';
                categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
            });
        
        return Object.entries(categoryTotals)
            .map(([category, amount]) => {
                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
                const percentage = metrics.expenses > 0 ? (amount / metrics.expenses * 100) : 0;
                
                return {
                    category,
                    name: config.name,
                    icon: config.icon,
                    color: config.color,
                    amount,
                    percentage,
                    value: amount,
                    label: config.name,
                    text: `${percentage.toFixed(0)}%`,
                };
            })
            .sort((a, b) => b.amount - a.amount);
    }, [transactions, metrics.expenses]);

    // Daily/Weekly data for chart
    const dailyData = useMemo(() => {
        if (viewMode === 'weekly') {
            const { start } = getISOWeekBounds(timeOffset);
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
            return days.map((day, index) => {
                const dayDate = new Date(start);
                dayDate.setDate(start.getDate() + index);
                
                const dayIncome = transactions
                    .filter(t => {
                        const txnDate = new Date(t.date);
                        return t.type === 'income' &&
                                txnDate.getDate() === dayDate.getDate() &&
                                txnDate.getMonth() === dayDate.getMonth() &&
                                txnDate.getFullYear() === dayDate.getFullYear();
                    })
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                
                const dayExpense = transactions
                    .filter(t => {
                        const txnDate = new Date(t.date);
                        return t.type === 'expense' &&
                                txnDate.getDate() === dayDate.getDate() &&
                                txnDate.getMonth() === dayDate.getMonth() &&
                                txnDate.getFullYear() === dayDate.getFullYear();
                    })
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                
                return { day, income: dayIncome, expense: dayExpense };
            });
        } else {
            // Monthly - show weeks
            const { start, end } = getMonthBounds(timeOffset);
            const weeks = [];
            
            let currentWeekStart = new Date(start);
            let weekIndex = 0;
            
            while (currentWeekStart <= end && weekIndex < 5) {
                const weekEnd = new Date(currentWeekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                const weekIncome = transactions
                    .filter(t => {
                        const txnDate = new Date(t.date);
                        return t.type === 'income' && txnDate >= currentWeekStart && txnDate <= weekEnd;
                    })
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                
                const weekExpense = transactions
                    .filter(t => {
                        const txnDate = new Date(t.date);
                        return t.type === 'expense' && txnDate >= currentWeekStart && txnDate <= weekEnd;
                    })
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                
                weeks.push({ 
                    day: `Week ${weekIndex + 1}`, 
                    income: weekIncome, 
                    expense: weekExpense 
                });
                
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
                weekIndex++;
            }
            
            return weeks;
        }
    }, [transactions, timeOffset, viewMode]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading report...</Text>
            </View>
        );
    }

    const bounds = viewMode === 'weekly' ? getISOWeekBounds(timeOffset) : getMonthBounds(timeOffset);
    const dateRange = viewMode === 'weekly' ? formatWeekRange(bounds.start, bounds.end) : formatMonthRange(bounds.start);
    
    // Calculate max value for scaling bars
    const maxValue = Math.max(...dailyData.flatMap(d => [d.income, d.expense]), 1);

    return (
        <LinearGradient colors={['#121212', '#1E1E1E']} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>{viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Report</Text>
                        <Text style={styles.headerSubtitle}>{dateRange}</Text>
                    </View>
                </View>

                {/* View Toggle */}
                <View style={styles.viewModeToggle}>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'weekly' && styles.activeToggleButton]}
                        onPress={() => { setViewMode('weekly'); setTimeOffset(0); setSelectedBar(null); }}
                    >
                        <Ionicons name="calendar" size={18} color={viewMode === 'weekly' ? '#fff' : '#9ca3af'} />
                        <Text style={[styles.toggleButtonText, viewMode === 'weekly' && styles.activeToggleButtonText]}>
                            Weekly
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, viewMode === 'monthly' && styles.activeToggleButton]}
                        onPress={() => { setViewMode('monthly'); setTimeOffset(0); setSelectedBar(null); }}
                    >
                        <Ionicons name="calendar-outline" size={18} color={viewMode === 'monthly' ? '#fff' : '#9ca3af'} />
                        <Text style={[styles.toggleButtonText, viewMode === 'monthly' && styles.activeToggleButtonText]}>
                            Monthly
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Navigation */}
                <View style={styles.periodNavigator}>
                    <TouchableOpacity style={styles.navButton} onPress={() => { setTimeOffset(prev => prev - 1); setSelectedBar(null); }}>
                        <Ionicons name="chevron-back" size={24} color="#10b981" />
                    </TouchableOpacity>
                    <Text style={[styles.navText, timeOffset === 0 && styles.currentNavText]}>
                        {timeOffset === 0 ? `This ${viewMode === 'weekly' ? 'Week' : 'Month'}` 
                            : `${Math.abs(timeOffset)} ${viewMode === 'weekly' ? 'week' : 'month'}${Math.abs(timeOffset) > 1 ? 's' : ''} ago`}
                    </Text>
                    <TouchableOpacity 
                        style={[styles.navButton, timeOffset === 0 && styles.navButtonDisabled]} 
                        onPress={() => { setTimeOffset(prev => Math.min(prev + 1, 0)); setSelectedBar(null); }}
                        disabled={timeOffset === 0}
                    >
                        <Ionicons name="chevron-forward" size={24} color={timeOffset === 0 ? '#4b5563' : '#10b981'} />
                    </TouchableOpacity>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <AnimatedCard delay={100} style={styles.summaryCard}>
                        <LinearGradient colors={['#10b981', '#059669']} style={styles.summaryGradient}>
                            <Ionicons name="arrow-up-circle" size={28} color="#fff" />
                            <Text style={styles.summaryLabel}>Income</Text>
                            <Text style={styles.summaryValue}>Rs. {metrics.income.toLocaleString()}</Text>
                        </LinearGradient>
                    </AnimatedCard>

                    <AnimatedCard delay={200} style={styles.summaryCard}>
                        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.summaryGradient}>
                            <Ionicons name="arrow-down-circle" size={28} color="#fff" />
                            <Text style={styles.summaryLabel}>Expenses</Text>
                            <Text style={styles.summaryValue}>Rs. {metrics.expenses.toLocaleString()}</Text>
                        </LinearGradient>
                    </AnimatedCard>

                    <AnimatedCard delay={300} style={styles.summaryCardWide}>
                        <LinearGradient 
                            colors={metrics.balance >= 0 ? ['#3b82f6', '#2563eb'] : ['#ef4444', '#dc2626']} 
                            style={styles.summaryGradient}
                        >
                            <Ionicons name="wallet" size={28} color="#fff" />
                            <Text style={styles.summaryLabel}>Balance</Text>
                            <Text style={styles.summaryValue}>Rs. {Math.abs(metrics.balance).toLocaleString()}</Text>
                        </LinearGradient>
                    </AnimatedCard>
                </View>

                {/* ✅ INTERACTIVE CHART - Tap bars to see amounts! */}
                <AnimatedCard delay={400}>
                    <View style={styles.chartHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Income vs Expenses</Text>
                            <Text style={styles.sectionSubtitle}>
                                Tap any bar to see amount • {viewMode === 'weekly' ? 'Daily' : 'Weekly'} view
                            </Text>
                        </View>
                        {selectedBar && (
                            <TouchableOpacity 
                                style={styles.clearButton}
                                onPress={() => setSelectedBar(null)}
                            >
                                <Ionicons name="close-circle" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {/* Selected Bar Info Display */}
                    {selectedBar && (
                        <Animated.View 
                            entering={FadeInDown.duration(300)}
                            style={styles.selectedInfo}
                        >
                            <View style={styles.selectedInfoRow}>
                                <View style={[styles.selectedDot, { backgroundColor: selectedBar.type === 'income' ? '#10b981' : '#ef4444' }]} />
                                <Text style={styles.selectedDay}>{selectedBar.day}</Text>
                                <Text style={styles.selectedType}>
                                    {selectedBar.type === 'income' ? 'Income' : 'Expense'}
                                </Text>
                            </View>
                            <Text style={styles.selectedAmount}>
                                Rs. {selectedBar.amount.toLocaleString()}
                            </Text>
                        </Animated.View>
                    )}
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                        <View style={styles.chartContainer}>
                            {dailyData.map((item, dayIndex) => {
                                const incomeHeight = (item.income / maxValue) * 160;
                                const expenseHeight = (item.expense / maxValue) * 160;
                                
                                return (
                                    <View key={dayIndex} style={styles.dayColumn}>
                                        {/* Income Bar */}
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                if (item.income > 0) {
                                                    setSelectedBar({
                                                        day: item.day,
                                                        type: 'income',
                                                        amount: item.income
                                                    });
                                                }
                                            }}
                                            style={styles.barTouchable}
                                        >
                                            <View style={styles.barContainer}>
                                                <View 
                                                    style={[
                                                        styles.bar, 
                                                        styles.incomeBar,
                                                        { height: Math.max(incomeHeight, 4) },
                                                        selectedBar?.day === item.day && selectedBar?.type === 'income' && styles.selectedBar
                                                    ]} 
                                                >
                                                    {selectedBar?.day === item.day && selectedBar?.type === 'income' && (
                                                        <View style={styles.barGlow} />
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        
                                        {/* Expense Bar */}
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                if (item.expense > 0) {
                                                    setSelectedBar({
                                                        day: item.day,
                                                        type: 'expense',
                                                        amount: item.expense
                                                    });
                                                }
                                            }}
                                            style={styles.barTouchable}
                                        >
                                            <View style={styles.barContainer}>
                                                <View 
                                                    style={[
                                                        styles.bar, 
                                                        styles.expenseBar,
                                                        { height: Math.max(expenseHeight, 4) },
                                                        selectedBar?.day === item.day && selectedBar?.type === 'expense' && styles.selectedBar
                                                    ]} 
                                                >
                                                    {selectedBar?.day === item.day && selectedBar?.type === 'expense' && (
                                                        <View style={styles.barGlow} />
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        
                                        {/* Day Label */}
                                        <Text style={[
                                            styles.dayLabel,
                                            selectedBar?.day === item.day && styles.selectedDayLabel
                                        ]}>
                                            {item.day}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                    
                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: '#10b981' }]} />
                            <Text style={styles.legendText}>Income</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: '#ef4444' }]} />
                            <Text style={styles.legendText}>Expenses</Text>
                        </View>
                    </View>
                </AnimatedCard>

                {/* Expense Breakdown */}
                {categoryData.length > 0 && (
                    <AnimatedCard delay={500}>
                        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
                        <Text style={styles.sectionSubtitle}>By category</Text>
                        
                        <View style={styles.pieContainer}>
                            <PieChart
                                data={categoryData}
                                donut
                                showText
                                textColor="#fff"
                                textSize={10}
                                radius={90}
                                innerRadius={50}
                                innerCircleColor="#1E1E1E"
                                focusOnPress
                                onPress={setSelectedCategory}
                                strokeColor="#1E1E1E"
                                strokeWidth={2}
                                centerLabelComponent={() => (
                                    selectedCategory ? (
                                        <View style={styles.pieCenter}>
                                            <Text style={styles.pieCenterValue}>{selectedCategory.percentage.toFixed(0)}%</Text>
                                            <Text style={styles.pieCenterLabel}>{selectedCategory.name}</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.pieCenter}>
                                            <Text style={styles.pieCenterValue}>
                                                {metrics.expenses >= 1000 ? `${(metrics.expenses/1000).toFixed(1)}k` : metrics.expenses}
                                            </Text>
                                            <Text style={styles.pieCenterLabel}>Total</Text>
                                        </View>
                                    )
                                )}
                            />
                        </View>
                        
                        {/* Category List */}
                        <View style={styles.categoryList}>
                            {categoryData.slice(0, 5).map((cat) => (
                                <View key={cat.category} style={styles.categoryItem}>
                                    <View style={styles.categoryLeft}>
                                        <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                    </View>
                                    <View style={styles.categoryRight}>
                                        <Text style={styles.categoryAmount}>Rs. {cat.amount.toLocaleString()}</Text>
                                        <Text style={styles.categoryPercent}>{cat.percentage.toFixed(0)}%</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </AnimatedCard>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    loadingText: { marginTop: 16, fontSize: 14, color: '#9ca3af' },
    scrollContent: { paddingBottom: 20 },
    header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f9fafb' },
    headerSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
    viewModeToggle: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: '#1f2937', borderRadius: 12, padding: 4 },
    toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, gap: 8 },
    activeToggleButton: { backgroundColor: '#10b981' },
    toggleButtonText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
    activeToggleButtonText: { color: '#fff' },
    periodNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#1f2937', borderRadius: 16 },
    navButton: { padding: 8 },
    navButtonDisabled: { opacity: 0.3 },
    navText: { fontSize: 16, color: '#9ca3af', fontWeight: '600' },
    currentNavText: { color: '#10b981' },
    summaryContainer: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
    card: { backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginHorizontal: 20, marginBottom: 16 },
    summaryCard: { height: 130 },
    summaryCardWide: { height: 130 },
    summaryGradient: { flex: 1, borderRadius: 16, padding: 16, justifyContent: 'space-between' },
    summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 4 },
    
    // Chart styles
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f9fafb', marginBottom: 4 },
    sectionSubtitle: { fontSize: 12, color: '#9ca3af' },
    clearButton: {
        padding: 4,
    },
    
    // Selected bar info
    selectedInfo: {
        backgroundColor: '#374151',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#4b5563',
    },
    selectedInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    selectedDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    selectedDay: {
        fontSize: 14,
        fontWeight: '600',
        color: '#d1d5db',
    },
    selectedType: {
        fontSize: 13,
        color: '#9ca3af',
    },
    selectedAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f9fafb',
    },
    
    // Chart container
    chartScroll: { marginBottom: 16 },
    chartContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: 10, 
        gap: 12,
        minWidth: SCREEN_WIDTH - 40,
        alignItems: 'flex-end',
        height: 220,
    },
    dayColumn: { 
        alignItems: 'center',
        flex: 1,
    },
    barTouchable: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    barContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bar: { 
        width: 28,
        borderRadius: 6,
        minHeight: 4,
        position: 'relative',
        overflow: 'visible',
    },
    incomeBar: { 
        backgroundColor: '#10b981',
        marginBottom: 6,
    },
    expenseBar: { 
        backgroundColor: '#ef4444',
        marginBottom: 6,
    },
    selectedBar: {
        opacity: 1,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    barGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
        opacity: 0.3,
    },
    dayLabel: { 
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '600',
        marginTop: 8,
    },
    selectedDayLabel: {
        color: '#10b981',
        fontWeight: 'bold',
    },
    legend: { 
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    legendItem: { 
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendBox: { 
        width: 16,
        height: 16,
        borderRadius: 4,
    },
    legendText: { 
        fontSize: 13,
        color: '#d1d5db',
        fontWeight: '600',
    },
    
    // Pie chart
    pieContainer: { alignItems: 'center', marginVertical: 20 },
    pieCenter: { justifyContent: 'center', alignItems: 'center' },
    pieCenterValue: { fontSize: 18, fontWeight: 'bold', color: '#f9fafb' },
    pieCenterLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
    categoryList: { marginTop: 16, gap: 12 },
    categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#374151' },
    categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    categoryDot: { width: 12, height: 12, borderRadius: 6 },
    categoryName: { fontSize: 14, color: '#f9fafb', fontWeight: '500' },
    categoryRight: { alignItems: 'flex-end' },
    categoryAmount: { fontSize: 14, fontWeight: 'bold', color: '#f9fafb' },
    categoryPercent: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});