import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../shared/context/AuthContext';
// FIX: Import logic ONLY from dataService. No direct Supabase/FileSystem calls here.
import { getDocuments, pickAndUploadFile, deleteDocument } from '../../services/dataService';
import { DocumentItem } from '../../types'; 
import { FileText, Share2, Camera, UploadCloud, Trash2 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

export default function DocumentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const data = await getDocuments(user.id);
      setDocs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (user) loadData();
  }, [user]);

  useFocusEffect(
      useCallback(() => {
          if (user) loadData();
      }, [user])
  );

  const handleExport = async () => {
    if (!user) return;
    try {
        // TODO: Implement exportDocumentsToCSV in dataService
        Alert.alert("Export", "Export feature coming soon.");
    } catch (e: any) {
        Alert.alert("Export Failed", e.message);
    }
  };

  const handleFileUpload = async () => {
      if (!user) return;
      setUploading(true);
      try {
          // Uses the dataService helper to handle all FileSystem/Supabase logic
          const result = await pickAndUploadFile(user.id);
          if (result) {
              Alert.alert("Success", "File uploaded successfully!");
              loadData();
          }
      } catch (e: any) {
          if (e.message !== 'User canceled') {
            Alert.alert("Upload Error", "Failed to upload file.");
          }
      } finally {
          setUploading(false);
      }
  };

  const handleDelete = async (docId: string, docName: string) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${docName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // I will need to create this function in dataService
              await deleteDocument(docId);
              Alert.alert("Success", "Document deleted successfully.");
              loadData();
            } catch (e: any) {
              Alert.alert("Error", "Failed to delete document.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="p-6 border-b border-white/5 flex-row justify-between items-center">
        <View>
            <Text className="text-white text-3xl font-bold">Documents</Text>
            <Text className="text-[#8892B0]">Receipts, Invoices & Contracts</Text>
        </View>
        
        <TouchableOpacity onPress={handleExport} className="bg-[#112240] p-3 rounded-xl border border-white/10">
            <Share2 size={20} color="#64FFDA" />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View className="flex-row px-6 py-4 gap-4">
          <TouchableOpacity 
            onPress={() => router.push('/(main)/scan')}
            className="flex-1 bg-[#64FFDA] p-4 rounded-xl flex-row items-center justify-center shadow-lg"
          >
              <Camera size={20} color="#0A192F" />
              <Text className="text-[#0A192F] font-bold ml-2">Scan Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleFileUpload}
            disabled={uploading}
            className="flex-1 bg-[#112240] p-4 rounded-xl border border-white/10 flex-row items-center justify-center"
          >
              {uploading ? <ActivityIndicator color="white" /> : <UploadCloud size={20} color="white" />}
              <Text className="text-white font-bold ml-2">Upload File</Text>
          </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={docs}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); loadData(); }} tintColor="#64FFDA" />}
        renderItem={({ item }) => (
            <View className="flex-row items-center p-4 mb-3 bg-[#112240] rounded-xl border border-white/5">
                <View className="w-10 h-10 bg-white/5 rounded-lg items-center justify-center">
                    <FileText size={20} color="#8892B0" />
                </View>
                <View className="ml-4 flex-1">
                    <Text className="text-white font-medium text-base">{item.name}</Text>
                    <Text className="text-[#8892B0] text-xs mt-1">{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2">
                    <Trash2 size={20} color="#F472B6" />
                </TouchableOpacity>
            </View>
        )}
        ListEmptyComponent={
            <View className="py-10 items-center opacity-50">
                <FileText size={40} color="#8892B0" />
                <Text className="text-[#8892B0] mt-4">No documents found.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}