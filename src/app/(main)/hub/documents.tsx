import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert, 
  ActivityIndicator, 
  RefreshControl, 
  TextInput 
} from 'react-native';
import { useAuth } from '../../../shared/context/AuthContext';
// Assuming the dataService functions are still globally imported/available from your unified service
import { getDocuments, pickAndUploadFile, deleteDocument } from '../../../services/dataService'; 
import { DocumentItem } from '../../../types'; 
import { FileText, Share2, Camera, UploadCloud, Trash2, Search, Image as ImageIcon, FileCheck, Filter } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function DocumentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Data State
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'receipt' | 'contract'>('all');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // The second argument to getDocuments is for client ID (CPA mode), not role.
      // For a user's own documents, it should be null or omitted.
      const data = await getDocuments(user.id);
      setDocs(data || []);
      filterData(data || [], searchQuery, activeFilter);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Local Filter Logic
  const filterData = (data: DocumentItem[], query: string, filter: string) => {
    let result = data;
    
    if (filter !== 'all') {
        result = result.filter(d => d.type === filter);
    }

    if (query && query.trim() !== '') {
        const lower = query.toLowerCase();
        result = result.filter(d => d.name && d.name.toLowerCase().includes(lower));
    }

    setFilteredDocs(result);
  };

  useEffect(() => {
    filterData(docs, searchQuery, activeFilter);
  }, [searchQuery, activeFilter, docs]);

  useFocusEffect(
      useCallback(() => {
          if (user) loadData();
      }, [user])
  );

  const handleExport = async () => {
    if (!filteredDocs.length) {
        Alert.alert("Export", "No documents to export.");
        return;
    }
    
    try {
        let csvContent = "File Name,Date,Size,Type\n";
        filteredDocs.forEach(d => {
            csvContent += `"${d.name}",${new Date(d.date).toISOString()},${d.formattedSize},${d.type}\n`;
        });

        const fileUri = FileSystem.documentDirectory + `NorthFinance_Docs_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            Alert.alert("Error", "Sharing not available on this device");
        }
    } catch (e: any) {
        Alert.alert("Export Failed", e.message);
    }
  };

  const handleFileUpload = async () => {
      if (!user) return;
      setUploading(true);
      try {
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
      `Are you sure you want to delete "${docName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDocument(docId);
              const newDocs = docs.filter(d => d.id !== docId);
              setDocs(newDocs);
              filterData(newDocs, searchQuery, activeFilter);
            } catch (e: any) {
              Alert.alert("Error", "Failed to delete document.");
              loadData();
            }
          },
        },
      ]
    );
  };

  const getIcon = (type: string, mime?: string) => {
      // FIX 2: Coerce null mime_type to undefined
      if (mime?.includes('pdf')) return <FileCheck size={24} color="#F59E0B" />; 
      return <ImageIcon size={24} color="#60A5FA" />; 
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-[#0A192F] border-b border-white/5">         <Text className="text-3xl font-bold text-white">My Documents</Text>
        <Text className="text-[#8892B0] text-sm mt-1">Securely store and manage your financial files.</Text>
      </View>

      {/* Search and Filter */}
      <View className="flex-row items-center px-6 py-4">
        <View className="flex-1 flex-row items-center bg-[#112240] rounded-xl px-4 py-3 border border-white/10">
          <Search size={20} color="#8892B0" />
          <TextInput 
            className="flex-1 ml-3 text-white" 
            placeholder="Search documents..." 
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          onPress={() => Alert.alert("Filter", "Coming Soon!")} 
          className="ml-3 p-3 bg-[#112240] rounded-xl border border-white/10"
        >
          <Filter size={20} color="#64FFDA" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-around px-6 mb-4">
        <TouchableOpacity 
          onPress={handleFileUpload} 
          disabled={uploading}
          className="flex-1 items-center py-3 mr-2 bg-[#64FFDA] rounded-xl flex-row justify-center shadow-lg shadow-[#64FFDA]/20"
        >
          {uploading ? <ActivityIndicator color="#0A192F" /> : <UploadCloud size={20} color="#0A192F" />}
          <Text className="ml-2 font-bold text-[#0A192F]">Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleExport} 
          className="flex-1 items-center py-3 ml-2 bg-[#112240] rounded-xl flex-row justify-center border border-white/10"
        >
          <Share2 size={20} color="#64FFDA" />
          <Text className="ml-2 font-bold text-[#64FFDA]">Export</Text>
        </TouchableOpacity>
      </View>

      {/* Document List */}
      {loading ? (
        <View className="items-center justify-center flex-1">   

          <ActivityIndicator color="#64FFDA" size="large" />
          <Text className="text-[#8892B0] mt-4 font-medium">Loading Documents...</Text>
        </View>      ) : filteredDocs.length === 0 ? (
        <View className="items-center justify-center flex-1 px-6">
          <FileText size={50} color="#8892B0" />
          <Text className="mt-4 text-xl font-bold text-white">No Documents Found</Text>
          <Text className="mt-2 text-center text-[#8892B0]">
            {searchQuery ? "No documents match your search criteria." : "Upload your first document to get started!"}
          </Text>
        </View>
        
      ) : (
        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between p-4 mx-6 mb-3 border rounded-xl bg-[#112240] border-white/10">
              <View className="flex-row items-center flex-1">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-lg bg-white/5">
      
                  
                 {/* <FileText size={24} color="#64FFDA" /> */}
                    
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-white" numberOfLines={1}>{item.name ?? 'Untitled Document'}</Text>
                  <Text className="text-xs text-[#8892B0]">{item.formattedSize} • {new Date(item.date ?? '').toLocaleDateString()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2 ml-3 rounded-full bg-red-500/10">
                <Trash2 size={20} color="#F87171" />
              </TouchableOpacity>
            </View>
            
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#64FFDA" />}
        />
      )}
    </SafeAreaView>
  );
}
  