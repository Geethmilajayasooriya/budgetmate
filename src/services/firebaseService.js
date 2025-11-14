import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { auth, db } from '../../firebase';

// Get current user ID
const getUserId = () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('No user logged in');
    }
    return user.uid;
};

// Default Budgets (for new users)
const defaultBudgets = {
    'food': 12000,
    'transport': 6000,
    'utilities': 4000,
    'shopping': 5000,
    'entertainment': 3000,
    'health': 5000,
};

// ==================== TRANSACTION FUNCTIONS ====================

// Add a new transaction
export const addTransaction = async (transactionData) => {
    try {
        const userId = getUserId();
        const transactionsRef = collection(db, 'users', userId, 'transactions');
        
        const transaction = {
            ...transactionData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        
        const docRef = await addDoc(transactionsRef, transaction);
        console.log('Transaction added successfully:', docRef.id);
        return { id: docRef.id, ...transaction };
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }
};

// Get all transactions for current user
export const getTransactions = async () => {
    try {
        const userId = getUserId();
        const transactionsRef = collection(db, 'users', userId, 'transactions');
        const q = query(transactionsRef, orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const transactions = [];
        
        querySnapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        
        console.log(`Retrieved ${transactions.length} transactions`);
        return transactions;
    } catch (error) {
        console.error('Error getting transactions:', error);
        throw error;
    }
};

// Update a transaction
export const updateTransaction = async (transactionId, updates) => {
    try {
        const userId = getUserId();
        const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
        
        const updateData = {
            ...updates,
            updatedAt: Timestamp.now(),
        };
        
        await updateDoc(transactionRef, updateData);
        return { id: transactionId, ...updateData };
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

// Delete a transaction
export const deleteTransaction = async (transactionId) => {
    try {
        const userId = getUserId();
        const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
        await deleteDoc(transactionRef);
        return transactionId;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

// Get transactions by type (income/expense)
export const getTransactionsByType = async (type) => {
    try {
        const userId = getUserId();
        const transactionsRef = collection(db, 'users', userId, 'transactions');
        const q = query(
            transactionsRef, 
            where('type', '==', type),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const transactions = [];
        
        querySnapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        
        return transactions;
    } catch (error) {
        console.error('Error getting transactions by type:', error);
        throw error;
    }
};

// Get transactions by category
export const getTransactionsByCategory = async (category) => {
    try {
        const userId = getUserId();
        const transactionsRef = collection(db, 'users', userId, 'transactions');
        const q = query(
            transactionsRef, 
            where('category', '==', category),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const transactions = [];
        
        querySnapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        
        return transactions;
    } catch (error) {
        console.error('Error getting transactions by category:', error);
        throw error;
    }
};

// ==================== BUDGET FUNCTIONS ====================

// Get all budgets for the current user
export const getBudgets = async () => {
    try {
        const userId = getUserId();
        const budgetsRef = collection(db, 'users', userId, 'budgets');
        const querySnapshot = await getDocs(budgetsRef);
        
        const budgets = {};
        if (querySnapshot.empty) {
            return {};
        }

        querySnapshot.forEach((doc) => {
            budgets[doc.id] = doc.data().amount;
        });
        
        return budgets;
    } catch (error) {
        console.error('Error getting budgets:', error);
        throw error;
    }
};

// Save or update a budget category
export const saveBudget = async (category, amount) => {
    try {
        const userId = getUserId();
        const budgetRef = doc(db, 'users', userId, 'budgets', category);
        
        await setDoc(budgetRef, { 
            amount: amount,
            updatedAt: Timestamp.now()
        });
        
        return { id: category, amount: amount };
    } catch (error) {
        console.error('Error saving budget:', error);
        throw error;
    }
};

// Seed default budgets for new users
export const seedDefaultBudgets = async () => {
    try {
        const userId = getUserId();
        const budgetsRef = collection(db, 'users', userId, 'budgets');
        
        const batch = writeBatch(db);

        for (const [category, amount] of Object.entries(defaultBudgets)) {
            const docRef = doc(budgetsRef, category);
            batch.set(docRef, { 
                amount: amount,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
        }
        
        await batch.commit();
        return defaultBudgets;
    } catch (error) {
        console.error('Error seeding default budgets:', error);
        throw error;
    }
};

// Delete a budget category
export const deleteBudget = async (category) => {
    try {
        const userId = getUserId();
        const budgetRef = doc(db, 'users', userId, 'budgets', category);
        await deleteDoc(budgetRef);
        return category;
    } catch (error) {
        console.error('Error deleting budget:', error);
        throw error;
    }
};
