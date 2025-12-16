import React, { useState, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, FlatList, 
  ActivityIndicator, RefreshControl, Alert, Image, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, FileText, Download, Trash2, Shield, Lock, Eye } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { getDocuments, uploadDocument, deleteDocument, pickAndUploadFile } from '../../services/dataService';
import { DocumentItem } from '../../types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function DocumentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getDocuments(user.id);
      setDocuments(data);
    } catch (error: any) {
      console.error('Documents Load Error:', error);
      Alert.alert('Error', 'Failed to load documents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    loadDocuments();
  }, [loadDocuments]));

  const handleUpload = async () => {
    if (!user) return;
    
    Alert.alert(
      'Upload Document',
      'Choose upload method',
      [
        { text: 'Camera', onPress: () => handleCameraUpload() },
        { text: 'Gallery', onPress: () => handleGalleryUpload() },
        { text: 'File Picker', onPress: () => handleFilePicker() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCameraUpload = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to scan receipts.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, result.assets[0].fileName || 'receipt.jpg', 'receipt');
    }
  };

  const handleGalleryUpload = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, result.assets[0].fileName || 'document.jpg', 'receipt');
    }
  };

  const handleFilePicker = async () => {
    if (!user) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0].uri, result.assets[0].name, 'other');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  const uploadFile = async (uri: string, fileName: string, type: 'receipt' | 'invoice' | 'contract' | 'other') => {
    if (!user) return;
    setUploading(true);
    try {
      await uploadDocument(user.id, uri, fileName, type);
      Alert.alert('Success', 'Document uploaded successfully.');
      loadDocuments();
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Could not upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: DocumentItem) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete ${doc.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(doc.id);
              loadDocuments();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete document.');
            }
          }
        }
      ]
    );
  };

  const handleDownload = async (doc: DocumentItem) => {
    if (doc.url) {
      try {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(doc.url);
        } else {
          Alert.alert('Sharing Not Available', 'Sharing is not supported on this device.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to share document.');
      }
    }
  };

  const renderDocument = ({ item }: { item: DocumentItem }) => (
    <TouchableOpacity
      onPress={() => { setSelectedDoc(item); setPreviewVisible(true); }}
      className="bg-[#112240] p-4 rounded-2xl mb-3 border border-white/5 flex-row items-center justify-between active:bg-[#162C52]"
    >
      <View className="flex-row items-center flex-1 mr-4">
        <View className="w-12 h-12 bg-[#0A192F] rounded-xl items-center justify-center mr-4 border border-white/5">
          <FileText size={24} color="#64FFDA" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-white" numberOfLines={1}>{item.name}</Text>
          <Text className="text-[#8892B0] text-xs mt-1">
            {item.formattedSize} • {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => handleDownload(item)}
          className="bg-[#64FFDA]/10 p-2 rounded-lg border border-[#64FFDA]/20"
        >
          <Download size={18} color="#64FFDA" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          className="bg-red-500/10 p-2 rounded-lg border border-red-500/20"
        >
          <Trash2 size={18} color="#F87171" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 pt-6 pb-4 border-b border-white/5">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-3xl font-extrabold text-white">Documents Vault</Text>
            <View className="flex-row items-center mt-1">
              <Lock size={12} color="#64FFDA" />
              <Text className="text-[#64FFDA] text-xs font-bold ml-1 uppercase">End-to-End Encrypted</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleUpload}
            disabled={uploading}
            className="bg-[#64FFDA] w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/20"
          >
            {uploading ? (
              <ActivityIndicator color="#0A192F" />
            ) : (
              <Plus size={24} color="#0A192F" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
          <Text className="text-[#8892B0] mt-4">Loading secure vault...</Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDocuments} tintColor="#64FFDA" />}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-50">
              <View className="w-20 h-20 bg-[#112240] rounded-full items-center justify-center mb-4 border border-white/5">
                <Shield size={40} color="#8892B0" />
              </View>
              <Text className="text-lg font-bold text-white mb-2">Vault Empty</Text>
              <Text className="text-[#8892B0] text-center px-8 leading-6">
                Upload receipts, invoices, or contracts to get started. All documents are encrypted and secure.
              </Text>
            </View>
          }
        />
      )}

      {/* Preview Modal */}
      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
        <View className="flex-1 bg-black/90 items-center justify-center p-6">
          <TouchableOpacity
            onPress={() => setPreviewVisible(false)}
            className="absolute top-12 right-6 p-2 bg-white/10 rounded-full"
          >
            <Text className="text-white text-xl font-bold">✕</Text>
          </TouchableOpacity>
          {selectedDoc && (
            <View className="w-full">
              <Text className="text-white text-lg font-bold mb-4 text-center">{selectedDoc.name}</Text>
              {selectedDoc.url && (
                <Image
                  source={{ uri: selectedDoc.url }}
                  className="w-full h-96 rounded-xl"
                  resizeMode="contain"
                />
              )}
              <View className="flex-row gap-4 mt-6 justify-center">
                <TouchableOpacity
                  onPress={() => selectedDoc && handleDownload(selectedDoc)}
                  className="bg-[#64FFDA] px-6 py-3 rounded-xl flex-row items-center"
                >
                  <Download size={18} color="#0A192F" />
                  <Text className="text-[#0A192F] font-bold ml-2">Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}


