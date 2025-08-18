import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../../context/ThemeProvider';
import { useAuth } from '../../../context/AuthContext';
import ScreenContainer from '../../../components/ScreenContainer';
import Button from '../../../components/common/Button';
import { ChevronLeft, Key, CheckCircle, XCircle } from 'lucide-react-native';

export default function ApiKeysScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [openaiKey, setOpenaiKey] = useState(user?.apiKeys?.openai || '');
  const [geminiKey, setGeminiKey] = useState(user?.apiKeys?.gemini || '');
  const [claudeKey, setClaudeKey] = useState(user?.apiKeys?.claude || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOpenaiKey(user?.apiKeys?.openai || '');
    setGeminiKey(user?.apiKeys?.gemini || '');
    setClaudeKey(user?.apiKeys?.claude || '');
  }, [user]);

  const handleSaveApiKeys = async () => {
    setIsLoading(true);
    try {
      await updateUser({
        apiKeys: {
          openai: openaiKey,
          gemini: geminiKey,
          claude: claudeKey,
        },
      });
      Alert.alert('Success', 'API keys saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API keys.');
      console.error('Failed to save API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (provider: string, key: string) => {
    if (!key) {
      Alert.alert('Error', `${provider} API Key is empty.`);
      return;
    }
    Alert.alert('Testing API Key', `Simulating connection test for ${provider}. In a real app, this would call an external API.`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    Alert.alert('Test Result', `${provider} API Key test successful! (Simulated)`);
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>API Key Management</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Manage your API keys for various AI providers. These keys are stored securely on your device.
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>OpenAI API Key</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={openaiKey}
            onChangeText={setOpenaiKey}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="sk-..."
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TouchableOpacity onPress={() => testApiKey('OpenAI', openaiKey)} style={[styles.testButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Google Gemini API Key</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={geminiKey}
            onChangeText={setGeminiKey}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="AIza..."
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TouchableOpacity onPress={() => testApiKey('Gemini', geminiKey)} style={[styles.testButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Anthropic Claude API Key</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={claudeKey}
            onChangeText={setClaudeKey}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            placeholder="sk-ant-api03-..."
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
          <TouchableOpacity onPress={() => testApiKey('Claude', claudeKey)} style={[styles.testButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <Button title="Save API Keys" onPress={handleSaveApiKeys} isLoading={isLoading} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: 'Inter-Bold', fontSize: 20, fontWeight: 'bold' },
  container: { padding: 16, paddingTop: 0 },
  description: { fontSize: 14, marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  input: { flex: 1, height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginRight: 8 },
  testButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  testButtonText: { color: '#fff', fontFamily: 'Inter-Bold', fontSize: 16 },
});
