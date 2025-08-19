import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { Stack } from 'expo-router';

const ProcessDocumentScreen = () => {
  const { colors } = useTheme();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const [documentName, setDocumentName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!documentName.trim()) {
      Alert.alert('Missing Name', 'Please give this document a name.');
      return;
    }
    setIsProcessing(true);

    // --- MOCK PROCESSING ---
    // In a real app, you would upload the image and call OCR/AI services here.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    
    Alert.alert(
      'Processing Complete',
      `The document "${documentName}" has been saved and is ready for categorization.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: 'Review Document', presentation: 'modal' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
        
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Document Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., Invoice from Acme Corp"
            placeholderTextColor={colors.textSecondary}
            value={documentName}
            onChangeText={setDocumentName}
          />

          <TouchableOpacity
            style={[styles.processButton, { backgroundColor: isProcessing ? colors.textSecondary : colors.primary }]}
            onPress={handleProcess}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.processButtonText}>Process Document</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  form: {
    padding: 24,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  processButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});

export default ProcessDocumentScreen;