import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import {
  FileText,
  Camera,
  Upload,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

interface Document {
  id: string;
  file_name: string;
  storage_path: string;
  extracted_text?: string;
  processed_data?: any;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  file_size_mb: number;
  mime_type: string;
  created_at: string;
}

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadDocument(result.assets[0]);
    }
  };

  const uploadDocument = async (asset: any) => {
    if (!user || !asset.base64) return;

    setUploading(true);
    try {
      const fileSize = asset.fileSize || 0;
      const fileSizeMB = fileSize / (1024 * 1024);
      
      // Check storage limit
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_limit_mb')
        .eq('id', user.id)
        .single();

      if (profile && fileSizeMB > profile.storage_limit_mb) {
        Alert.alert(
          'File too large',
          `File size (${fileSizeMB.toFixed(1)}MB) exceeds your limit of ${profile.storage_limit_mb}MB. Upgrade your plan for higher limits.`
        );
        return;
      }

      const fileName = `document-${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(asset.base64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Create database record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: fileName,
          storage_path: filePath,
          status: 'uploaded',
          file_size_mb: fileSizeMB,
          mime_type: 'image/jpeg',
        });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Document uploaded successfully!');
      loadDocuments();
    } catch (error: any) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (doc: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.file_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from storage
              await supabase.storage
                .from('documents')
                .remove([doc.storage_path]);

              // Delete from database
              await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

              loadDocuments();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock size={16} color={colors.warning} />;
      case 'processing':
        return <ActivityIndicator size={16} color={colors.primary} />;
      case 'processed':
        return <CheckCircle size={16} color={colors.success} />;
      case 'error':
        return <AlertCircle size={16} color={colors.error} />;
      default:
        return <FileText size={16} color={colors.textSecondary} />;
    }
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <View style={[styles.documentCard, { backgroundColor: colors.surface }]}>
      <View style={styles.documentHeader}>
        <View style={styles.documentInfo}>
          <Text style={[styles.documentName, { color: colors.text }]}>
            {item.file_name}
          </Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // View document details
            }}
          >
            <Eye size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteDocument(item)}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.documentSize, { color: colors.textSecondary }]}>
        {item.file_size_mb?.toFixed(2)} MB • {new Date(item.created_at).toLocaleDateString()}
      </Text>
      
      {item.processed_data && (
        <View style={styles.extractedData}>
          <Text style={[styles.extractedTitle, { color: colors.text }]}>
            Extracted Data:
          </Text>
          <Text style={[styles.extractedText, { color: colors.textSecondary }]}>
            {JSON.stringify(item.processed_data, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Documents
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={takePhoto}
            disabled={uploading}
          >
            <Camera size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={pickDocument}
            disabled={uploading}
          >
            <Upload size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.uploadingText, { color: colors.textSecondary }]}>
            Uploading document...
          </Text>
        </View>
      )}

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Documents Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Upload receipts and invoices to get started with AI-powered data extraction.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  uploadingText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  documentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  documentSize: {
    fontSize: 12,
    marginBottom: 8,
  },
  extractedData: {
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  extractedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  extractedText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
});