import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { KeyRound, Check, X } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastProvider';
import { saveApiKeys, getApiKeys, testApiKeyConnection } from '@/services/settingsService';
import ScreenContainer from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Cards } from '@/components/Cards';

type Provider = 'openai' | 'gemini' | 'claude';
type TestStatus = 'untested' | 'testing' | 'success' | 'failure';

const ApiKeyInput = ({ provider, value, onChange, onTest, testStatus, colors }: any) => {
    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{provider.toUpperCase()} API Key</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder={`Enter your ${provider} key`}
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                />
                <Button title="Test" onPress={onTest} size="small" variant="outline" style={{ height: 50 }} />
                <View style={styles.statusIcon}>
                    {testStatus === 'testing' && <ActivityIndicator size="small" />}
                    {testStatus === 'success' && <Check color={colors.success} />}
                    {testStatus === 'failure' && <X color={colors.error} />}
                </View>
            </View>
        </View>
    );
};

export default function ApiKeysScreen() {
    const { theme } = useTheme();
    const { colors } = theme;
    const { profile } = useAuth();
    const { showToast } = useToast();
    const [keys, setKeys] = useState({ openai_key: '', gemini_key: '', claude_key: '' });
    const [testStatuses, setTestStatuses] = useState<Record<Provider, TestStatus>>({ openai: 'untested', gemini: 'untested', claude: 'untested' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchKeys = useCallback(async () => {
        if (!profile) return;
        setFetching(true);
        try {
            const savedKeys = await getApiKeys(profile.id);
            setKeys({
                openai_key: savedKeys.openai_key || '',
                gemini_key: savedKeys.gemini_key || '',
                claude_key: savedKeys.claude_key || '',
            });
        } catch (error) {
            showToast('Failed to load saved API keys.', 'error');
        } finally {
            setFetching(false);
        }
    }, [profile, showToast]);

    useFocusEffect(
        useCallback(() => {
            fetchKeys();
        }, [fetchKeys])
    );

    const handleTest = async (provider: Provider) => {
        const key = keys[`${provider}_key` as keyof typeof keys];
        setTestStatuses(prev => ({ ...prev, [provider]: 'testing' }));
        const success = await testApiKeyConnection(provider, key);
        setTestStatuses(prev => ({ ...prev, [provider]: success ? 'success' : 'failure' }));
        showToast(success ? `${provider.toUpperCase()} connection successful!` : `${provider.toUpperCase()} connection failed.`, success ? 'success' : 'error');
    };

    const handleSave = async () => {
        if (!profile) return;
        setLoading(true);
        try {
            await saveApiKeys(profile.id, keys);
            showToast('API keys saved successfully!', 'success');
        } catch (error) {
            showToast('Failed to save API keys.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <ScreenContainer style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>
    }

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <ApiKeyInput provider="openai" value={keys.openai_key} onChange={(text: string) => setKeys({ ...keys, openai_key: text })} onTest={() => handleTest('openai')} testStatus={testStatuses.openai} colors={colors} />
                <ApiKeyInput provider="gemini" value={keys.gemini_key} onChange={(text: string) => setKeys({ ...keys, gemini_key: text })} onTest={() => handleTest('gemini')} testStatus={testStatuses.gemini} colors={colors} />
                <ApiKeyInput provider="claude" value={keys.claude_key} onChange={(text: string) => setKeys({ ...keys, claude_key: text })} onTest={() => handleTest('claude')} testStatus={testStatuses.claude} colors={colors} />
                <Button title="Save Keys" onPress={handleSave} isLoading={loading} style={{ marginTop: 24 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    container: { padding: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: { flex: 1, height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1 },
    statusIcon: { width: 30, alignItems: 'center' },
});
