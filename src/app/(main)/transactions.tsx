    import React, { useState, useMemo } from 'react';   
    import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
    import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Search, SlidersHorizontal } from 'lucide-react-native';
    import { useTheme } from '@/shared/context/ThemeProvider';
    import { useTransactions } from '@/features/transactions/useTransactions';
    import ScreenContainer from '@/shared/components/ScreenContainer';
    import { Transaction } from '@/shared/types';
    import { Button } from '@/shared/components/Button';
    import { Cards } from '@/shared/components/Cards';  
    import { useAuth } from '@/shared/context/AuthContext';
    import AddTransactionModal from '@/features/transactions/AddTransactionModal';
    import { getCategories } from '@/shared/services/budgetService';
    import { getChartOfAccounts } from '@/shared/services/accountingService';

    // A dedicated component for each transaction item for better organization      
// A dedicated component for each transaction item for better organization
const TransactionListItem = ({ item, colors }: { item: Transaction, colors: any }) => {
    const isIncome = item.type === 'income';
    const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
    const amountColor = isIncome ? colors.success : colors.text;
    return ( 
        <Cards style={styles.transactionCards}>
            <View style={styles.leftContent}> 
                <Icon color={isIncome ? colors.success : colors.error} size={32} />
                <View style={styles.details}>
                    <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text> 
                    <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
                </View>
            </View> 
            <View style={styles.rightContent}> 
                <Text style={[styles.amount, { color: amountColor }]}> 
                    {isIncome ? '+' : '-'}${Math.abs(item.amount).toFixed(2)} 
                </Text> 
                <Text style={[styles.date, { color: colors.textSecondary }]}> 
                    {new Date(item.date).toLocaleDateString()} 
                </Text>
            </View> 

        </Cards>    
        );    
    };
    


const styles = StyleSheet.create({
    listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 30,
        gap: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    searchInput: {
        height: 48,
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    transactionCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12, // Use margin for spacing between Cards
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    details: {},
    description: {
        fontSize: 16,
        fontWeight: '600',
    },
    category: {
        fontSize: 14,
        marginTop: 4,
    },
    rightContent: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        marginTop: 4,
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
});