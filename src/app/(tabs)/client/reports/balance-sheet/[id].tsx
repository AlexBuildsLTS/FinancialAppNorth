import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { getBalanceSheetData, getClientById } from '@/services/dataService';
import { Client, Account, FixedAsset, Liability } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';

const useBalanceSheet = (clientId: string) => {
    const [client, setClient] = React.useState<Client | null>(null);
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!clientId) return;
        const loadData = async () => {
            setLoading(true);
            try {
                const [clientData, sheetData] = await Promise.all([
                    getClientById(clientId),
                    getBalanceSheetData(clientId)
                ]);
                setClient(clientData || null);

                const currentAssets = sheetData.accounts.filter(a => a.type === 'checking' || a.type === 'savings');
                const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + a.balance, 0);
                const totalFixedAssets = sheetData.assets.reduce((sum, a) => sum + a.value, 0);
                const totalAssets = totalCurrentAssets + totalFixedAssets;

                const totalLiabilities = sheetData.liabilities.reduce((sum, l) => sum + l.balance, 0);
                const totalEquity = totalAssets - totalLiabilities;
                
                setData({ ...sheetData, currentAssets, totalCurrentAssets, totalFixedAssets, totalAssets, totalLiabilities, totalEquity });
            } catch (error) {
                console.error("Failed to load balance sheet data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [clientId]);

    return { client, data, loading };
}

const ReportRow = ({ label, value, level = 1, isTotal = false, colors }: any) => (
    <View style={[styles.row, isTotal && { borderTopWidth: 1, paddingTop: 12, marginTop: 8, borderTopColor: colors.border }]}>
        <Text style={[styles.rowLabel, { marginLeft: level === 2 ? 16 : 0, fontWeight: isTotal ? 'bold' : 'normal', color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowValue, { fontWeight: isTotal ? 'bold' : 'normal', color: colors.text }]}>
            ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
    </View>
);

export default function BalanceSheetScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const { client, data, loading } = useBalanceSheet(id as string);

    if (loading) {
        return <ScreenContainer><ActivityIndicator style={styles.centered} size="large" color={colors.primary} /></ScreenContainer>;
    }

    return (
        <ScreenContainer>
            <Stack.Screen options={{ title: 'Balance Sheet' }} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.clientName, { color: colors.text }]}>{client?.companyName}</Text>
                    <Text style={[styles.reportTitle, { color: colors.textSecondary }]}>Balance Sheet as of {new Date().toLocaleDateString()}</Text>
                </View>

                <View style={[styles.reportContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Assets</Text>
                    <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Current Assets</Text>
                    {data.currentAssets.map((asset: Account) => <ReportRow key={asset.id} label={asset.name} value={asset.balance} level={2} colors={colors} />)}
                    <ReportRow label="Total Current Assets" value={data.totalCurrentAssets} isTotal colors={colors} />

                    <Text style={[styles.subHeader, { color: colors.textSecondary, marginTop: 16 }]}>Fixed Assets</Text>
                    {data.assets.map((asset: FixedAsset) => <ReportRow key={asset.id} label={asset.name} value={asset.value} level={2} colors={colors} />)}
                    <ReportRow label="Total Fixed Assets" value={data.totalFixedAssets} isTotal colors={colors} />
                    
                    <ReportRow label="Total Assets" value={data.totalAssets} isTotal colors={colors} />

                    <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 24 }]}>Liabilities & Equity</Text>
                    <Text style={[styles.subHeader, { color: colors.textSecondary }]}>Liabilities</Text>
                    {data.liabilities.map((lib: Liability) => <ReportRow key={lib.id} label={lib.name} value={lib.balance} level={2} colors={colors} />)}
                    <ReportRow label="Total Liabilities" value={data.totalLiabilities} isTotal colors={colors} />
                    
                    <Text style={[styles.subHeader, { color: colors.textSecondary, marginTop: 16 }]}>Equity</Text>
                    <ReportRow label="Owner's Equity" value={data.totalEquity} level={2} colors={colors} />
                    <ReportRow label="Total Equity" value={data.totalEquity} isTotal colors={colors} />

                    <ReportRow label="Total Liabilities & Equity" value={data.totalLiabilities + data.totalEquity} isTotal colors={colors} />
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 16, paddingBottom: 48 },
    header: { marginBottom: 24 },
    clientName: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    reportTitle: { fontSize: 16, textAlign: 'center', marginTop: 4 },
    reportContainer: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)' },
    subHeader: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    rowLabel: { fontSize: 16 },
    rowValue: { fontSize: 16, fontVariant: ['tabular-nums'] },
});