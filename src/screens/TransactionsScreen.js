import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import EmptyState from '../components/EmptyState';


export default function TransactionsScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState('All');


    // Start with an empty array to demonstrate the empty state
    const transactions = []; 


    const filters = ['All', 'Income', 'Expense'];


    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'All' || (selectedFilter === 'Income' && transaction.type === 'income') || (selectedFilter === 'Expense' && transaction.type === 'expense');
        return matchesSearch && matchesFilter;
    });


    const renderTransaction = ({ item }) => (
        <TouchableOpacity style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
                <Ionicons 
                    name={item.amount > 0 ? 'arrow-up-circle' : 'arrow-down-circle'} 
                    size={30} 
                    color={item.amount > 0 ? theme.colors.success : theme.colors.danger} 
                />
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionCategory}>{item.category}</Text>
            </View>
            <View style={styles.transactionAmount}>
                <Text style={[
                    styles.transactionAmountText, 
                    { color: item.amount > 0 ? theme.colors.success : theme.colors.danger }
                ]}>
                    {item.amount > 0 ? '+' : '-'}Rs. {Math.abs(item.amount).toLocaleString()}
                </Text>
                <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons 
                    name="search" 
                    size={20} 
                    color={theme.colors.text_secondary} 
                    style={{ marginLeft: theme.spacing.sm }}
                />
                <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search transactions..." 
                    placeholderTextColor={theme.colors.text_secondary} 
                    value={searchQuery} 
                    onChangeText={setSearchQuery} 
                />
            </View>


            <View style={styles.filterContainer}>
                {filters.map((filter) => (
                    <TouchableOpacity 
                        key={filter} 
                        style={[styles.filterTab, selectedFilter === filter && styles.activeFilterTab]} 
                        onPress={() => setSelectedFilter(filter)}
                    >
                        <Text style={[
                            styles.filterText, 
                            selectedFilter === filter && styles.activeFilterText
                        ]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>


            {filteredTransactions.length > 0 ? (
                <FlatList
                    data={filteredTransactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState
                    icon="list-outline"
                    title="No Transactions Yet"
                    message="When you add a transaction, it will appear here."
                    actionText="Add First Transaction"
                    onAction={() => navigation.navigate('AddTransaction')}
                />
            )}


            {/* ✅ NEW: Floating Scan Button (Always visible) */}
            <TouchableOpacity
                style={styles.fabScanButton}
                onPress={() => navigation.navigate('ScanReceipt')}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="scan" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Existing Add Button (Only when transactions exist) */}
            {transactions.length > 0 && (
                 <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('AddTransaction')}
                 >
                    <Ionicons name="add" size={30} color={theme.colors.white} />
                </TouchableOpacity>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: theme.colors.background, 
        paddingTop: theme.spacing.md 
    },
    searchContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: theme.colors.surface, 
        borderRadius: theme.borderRadius.md, 
        marginHorizontal: theme.spacing.md, 
        marginBottom: theme.spacing.md, 
        paddingHorizontal: theme.spacing.sm 
    },
    searchInput: { 
        flex: 1, 
        padding: theme.spacing.md, 
        fontSize: theme.fontSize.base, 
        color: theme.colors.text_primary 
    },
    filterContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: theme.spacing.md, 
        marginBottom: theme.spacing.md, 
        gap: theme.spacing.sm 
    },
    filterTab: { 
        paddingHorizontal: theme.spacing.md, 
        paddingVertical: theme.spacing.sm, 
        borderRadius: theme.borderRadius.full, 
        backgroundColor: theme.colors.surface 
    },
    activeFilterTab: { 
        backgroundColor: theme.colors.primary 
    },
    filterText: { 
        fontSize: theme.fontSize.sm, 
        color: theme.colors.text_secondary, 
        fontWeight: '600' 
    },
    activeFilterText: { 
        color: theme.colors.white 
    },
    listContainer: { 
        paddingHorizontal: theme.spacing.md, 
        paddingBottom: 100 // ✅ Increased to prevent overlap with FAB
    },
    transactionItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: theme.colors.surface, 
        padding: theme.spacing.md, 
        borderRadius: theme.borderRadius.lg, 
        marginBottom: theme.spacing.sm 
    },
    transactionIcon: { 
        width: 40, 
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: theme.spacing.md 
    },
    transactionDetails: { 
        flex: 1 
    },
    transactionTitle: { 
        fontSize: theme.fontSize.base, 
        fontWeight: '600', 
        color: theme.colors.text_primary 
    },
    transactionCategory: { 
        fontSize: theme.fontSize.sm, 
        color: theme.colors.text_secondary 
    },
    transactionAmount: { 
        alignItems: 'flex-end' 
    },
    transactionAmountText: { 
        fontSize: theme.fontSize.base, 
        fontWeight: 'bold' 
    },
    transactionDate: { 
        fontSize: theme.fontSize.sm, 
        color: theme.colors.text_secondary 
    },
    addButton: { 
        position: 'absolute', 
        bottom: 30, 
        right: 30, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        backgroundColor: theme.colors.primary, 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    // ✅ NEW: Floating Scan Button Styles
    fabScanButton: {
        position: 'absolute',
        bottom: 30,
        left: 30, // ✅ Positioned on the left side
        width: 64,
        height: 64,
        borderRadius: 32,
        elevation: 8,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        zIndex: 999,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
