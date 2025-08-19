import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const ProcessDocumentScreen = () => {
  const { colors } = useTheme();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [documentName, setDocumentName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!imageUri || !user) {
      Alert.alert('Error', 'Image or user is missing.');
      return;
    }
    if (!documentName.trim()) {
      Alert.alert('Missing Name', 'Please give this document a name.');
      return;
    }

    setIsProcessing(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const fileName = `${documentName.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;
      const contentType = 'image/jpeg';

      // Step 1: Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { contentType });

      if (uploadError) throw uploadError;

      // Step 2: Create a record in the 'documents' database table
      const { error: insertError } = await supabase.from('documents').insert({
        user_id: user.id,
        file_name: documentName,
        storage_path: filePath,
        status: 'uploaded',
      });

      if (insertError) throw insertError;

      Alert.alert(
        'Upload Complete',
        `The document "${documentName}" has been successfully uploaded.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error: any) {
      console.error('Error processing document:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
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
              <Text style={styles.processButtonText}>Upload Document</Text>
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