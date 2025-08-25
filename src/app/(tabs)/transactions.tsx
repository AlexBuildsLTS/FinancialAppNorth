import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useTransactions } from '@/hooks/useTransactions';
import ScreenContainer from '@/components/ScreenContainer';
import Card from '@/components/common/Card';
import { Transaction } from '@/types';

// A dedicated component for each transaction item for better organization
const TransactionListItem = ({ item, colors }: { item: Transaction, colors: any }) => {
    const isIncome = item.type === 'income';
    const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
    const amountColor = isIncome ? colors.success : colors.text;

    return (
        <Card style={styles.transactionCard}>
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
        </Card>
    );
};

export default function TransactionsScreen() {
    const { colors } = useTheme();
    const { transactions } = useTransactions();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTransactions = useMemo(() => {
        if (!searchQuery) {
            return transactions;
        }
        return transactions.filter(t =>
            t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [transactions, searchQuery]);

    const renderHeader = () => (
        <>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
                    <PlusCircle color={colors.primaryContrast} size={20} />
                    <Text style={[styles.addButtonText, { color: colors.primaryContrast }]}>New</Text>
                </TouchableOpacity>
            </View>
             <View style={styles.filterContainer}>
                <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Search color={colors.textSecondary} size={20} />
                    <TextInput
                        placeholder="Search transactions..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <SlidersHorizontal color={colors.primary} size={20} />
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <ScreenContainer>
            <FlatList
                data={filteredTransactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <TransactionListItem item={item} colors={colors} />}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No transactions found.
                        </Text>
                    </View>
                )}
            />
        </ScreenContainer>
    );
}

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
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12, // Use margin for spacing between cards
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