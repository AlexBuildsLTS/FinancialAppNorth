import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bot, Key, Settings as SettingsIcon, Zap, Brain, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Save } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AIProvider } from '@/types';

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT',
    apiEndpoint: 'https://api.openai.com/v1',
    requiresApiKey: true,
    supportedFormats: ['text', 'image', 'pdf']
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
    requiresApiKey: true,
    supportedFormats: ['text', 'image', 'pdf']
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    apiEndpoint: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    supportedFormats: ['text', 'image']
  }
];

export default function AIAssistantScreen() {
  const { colors, isDark } = useTheme();
  const { user, updateUser } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [apiKeys, setApiKeys] = useState({
    openai: user?.apiKeys?.openai || '',
    gemini: user?.apiKeys?.gemini || '',
    claude: user?.apiKeys?.claude || ''
  });
  const [autoProcess, setAutoProcess] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: 'success' | 'error' | 'untested'}>({
    openai: 'untested',
    gemini: 'untested',
    claude: 'untested'
  });

  const styles = createStyles(colors);

  const handleSaveApiKey = async (provider: string, key: string) => {
    const updatedApiKeys = { ...apiKeys, [provider]: key };
    setApiKeys(updatedApiKeys);
    
    if (updateUser) {
      await updateUser({ apiKeys: updatedApiKeys });
    }
    
    Alert.alert('Success', `${provider.toUpperCase()} API key saved successfully`);
  };

  const testConnection = async (provider: string) => {
    if (!apiKeys[provider as keyof typeof apiKeys]) {
      Alert.alert('Error', 'Please enter an API key first');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Simulate API test - in production, make actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success for demo
      setConnectionStatus(prev => ({ ...prev, [provider]: 'success' }));
      Alert.alert('Success', `${provider.toUpperCase()} connection successful!`);
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'error' }));
      Alert.alert('Error', `Failed to connect to ${provider.toUpperCase()}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusIcon = (provider: string) => {
    const status = connectionStatus[provider];
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color={colors.success} />;
      case 'error':
        return <AlertCircle size={20} color={colors.error} />;
      default:
        return <AlertCircle size={20} color={colors.textSecondary} />;
    }
  };

  const getStatusColor = (provider: string) => {
    const status = connectionStatus[provider];
    switch (status) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScreenContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Bot size={28} color={colors.primary} />
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <SettingsIcon size={24} color={colors.textSecondary} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Brain size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>AI-Powered Document Processing</Text>
            </View>
            <Text style={styles.infoText}>
              Configure AI providers to automatically extract, categorize, and process 
              financial data from scanned documents. Perfect for accountants managing 
              multiple clients.
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Card>
            <Text style={styles.cardTitle}>AI Provider Selection</Text>
            <Text style={styles.cardSubtitle}>
              Choose your preferred AI service for document processing
            </Text>
            
            <View style={styles.providerList}>
              {AI_PROVIDERS.map((provider, index) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerItem,
                    selectedProvider === provider.id && styles.selectedProvider
                  ]}
                  onPress={() => setSelectedProvider(provider.id)}
                >
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerFormats}>
                      Supports: {provider.supportedFormats.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.providerStatus}>
                    {getStatusIcon(provider.id)}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Card>
            <Text style={styles.cardTitle}>API Configuration</Text>
            <Text style={styles.cardSubtitle}>
              Enter your API keys for the selected providers
            </Text>

            {AI_PROVIDERS.map((provider) => (
              <View key={provider.id} style={styles.apiKeySection}>
                <View style={styles.apiKeyHeader}>
                  <Text style={styles.apiKeyLabel}>{provider.name} API Key</Text>
                  {getStatusIcon(provider.id)}
                </View>
                
                <View style={styles.apiKeyInputContainer}>
                  <TextInput
                    style={styles.apiKeyInput}
                    value={apiKeys[provider.id as keyof typeof apiKeys]}
                    onChangeText={(text) => setApiKeys(prev => ({ ...prev, [provider.id]: text }))}
                    placeholder={`Enter your ${provider.name} API key`}
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                  />
                  <TouchableOpacity
                    style={styles.saveKeyButton}
                    onPress={() => handleSaveApiKey(provider.id, apiKeys[provider.id as keyof typeof apiKeys])}
                  >
                    <Save size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <Button
                  title={isTestingConnection ? 'Testing...' : 'Test Connection'}
                  onPress={() => testConnection(provider.id)}
                  variant="outline"
                  size="small"
                  isLoading={isTestingConnection}
                  style={styles.testButton}
                />
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <Card>
            <Text style={styles.cardTitle}>Processing Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-Process Documents</Text>
                <Text style={styles.settingDescription}>
                  Automatically process scanned documents with AI
                </Text>
              </View>
              <Switch
                value={autoProcess}
                onValueChange={setAutoProcess}
                trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Export Format</Text>
                <Text style={styles.settingDescription}>
                  Default format for processed data export
                </Text>
              </View>
              <TouchableOpacity style={styles.formatSelector}>
                <Text style={styles.formatText}>CSV</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        {user?.role === 'Accountant' && (
          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <Card style={styles.proTipCard}>
              <View style={styles.proTipHeader}>
                <Zap size={20} color={colors.warning} />
                <Text style={styles.proTipTitle}>Pro Tip</Text>
              </View>
              <Text style={styles.proTipText}>
                For best results with client documents, use OpenAI GPT-4 Vision for 
                complex invoices and receipts. Gemini works great for simple text extraction.
              </Text>
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    infoCard: {
      marginBottom: 20,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    providerList: {
      gap: 12,
    },
    providerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedProvider: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    providerInfo: {
      flex: 1,
    },
    providerName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    providerFormats: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    providerStatus: {
      marginLeft: 12,
    },
    apiKeySection: {
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    apiKeyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    apiKeyLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    apiKeyInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    apiKeyInput: {
      flex: 1,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.background,
    },
    saveKeyButton: {
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    testButton: {
      alignSelf: 'flex-start',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    formatSelector: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    formatText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    proTipCard: {
      marginTop: 20,
    },
    proTipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    proTipTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    proTipText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });