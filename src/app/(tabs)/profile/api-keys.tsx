import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, AlertTriangle, KeyRound } from 'lucide-react-native';

const ApiKeysScreen = () => {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const [openAIKey, setOpenAIKey] = useState(user?.apiKeys?.openai || '');
  const [geminiKey, setGeminiKey] = useState(user?.apiKeys?.gemini || '');
  const [claudeKey, setClaudeKey] = useState(user?.apiKeys?.claude || '');
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    [key: string]: 'success' | 'error' | null;
  }>({});

  const handleSaveKeys = () => {
    updateUser({
      apiKeys: {
        openai: openAIKey,
        gemini: geminiKey,
        claude: claudeKey,
      },
    });
    Alert.alert('Success', 'Your API keys have been saved.');
  };

  // Mock API key test function
  const handleTestKey = async (provider: 'openai' | 'gemini' | 'claude') => {
    setIsTesting(provider);
    setTestResult({ ...testResult, [provider]: null });

    // Simulate a network request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, you'd make an actual API call.
    // Here, we'll just check if the key is not empty for a mock success.
    let success = false;
    if (provider === 'openai' && openAIKey.length > 5) success = true;
    if (provider === 'gemini' && geminiKey.length > 5) success = true;
    if (provider === 'claude' && claudeKey.length > 5) success = true;

    setTestResult({ ...testResult, [provider]: success ? 'success' : 'error' });
    setIsTesting(null);
  };

  const ApiKeyInput = ({ label, value, onChangeText, provider }: any) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.inputRow}>
        <KeyRound
          color={colors.textSecondary}
          size={20}
          style={styles.keyIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={`Enter your ${label} key`}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry
        />
        <TouchableOpacity
          style={[
            styles.testButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => handleTestKey(provider)}
          disabled={!!isTesting}
        >
          {isTesting === provider ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              Test
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {testResult[provider] === 'success' && (
        <View style={styles.resultContainer}>
          <CheckCircle color={colors.success} size={16} />
          <Text style={[styles.resultText, { color: colors.success }]}>
            Connection successful!
          </Text>
        </View>
      )}
      {testResult[provider] === 'error' && (
        <View style={styles.resultContainer}>
          <AlertTriangle color={colors.error} size={16} />
          <Text style={[styles.resultText, { color: colors.error }]}>
            Connection failed. Please check your key.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.form}>
        <ApiKeyInput
          label="OpenAI"
          value={openAIKey}
          onChangeText={setOpenAIKey}
          provider="openai"
        />
        <ApiKeyInput
          label="Google Gemini"
          value={geminiKey}
          onChangeText={setGeminiKey}
          provider="gemini"
        />
        <ApiKeyInput
          label="Anthropic Claude"
          value={claudeKey}
          onChangeText={setClaudeKey}
          provider="claude"
        />
      </View>
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveKeys}
      >
        <Text style={styles.saveButtonText}>Save All Keys</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 24 },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  keyIcon: { position: 'absolute', left: 12, zIndex: 1 },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40, // Space for the icon
    paddingRight: 16,
    fontSize: 14,
  },
  testButton: {
    marginLeft: 8,
    height: 50,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  testButtonText: { fontFamily: 'Inter-Bold' },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  resultText: { fontFamily: 'Inter-Regular', fontSize: 12 },
  saveButton: {
    marginHorizontal: 24,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});

export default ApiKeysScreen;
