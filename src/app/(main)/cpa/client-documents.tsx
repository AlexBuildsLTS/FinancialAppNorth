import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, ArrowLeft, Download, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
// FIX: Use unified dataService
import { isCpaForClient, getSharedDocuments, getCpaClients } from '../../../services/dataService'; 

interface ClientDocument {
  id: string;
  file_name: string;
  file_path: string;
  mime_type?: string;
  size_bytes?: number;
  created_at: string;
  status?: string;
}

export default function ClientDocumentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientDocuments();
  }, [clientId, user]);

  const loadClientDocuments = async () => {
    if (!user || !clientId) return;

    try {
      const isAuthorized = await isCpaForClient(user.id, clientId as string);
      if (!isAuthorized) {
        Alert.alert('Access Denied', 'You are not authorized to view this client\'s documents.');
        router.back();
        return;
      }

      const clients = await getCpaClients(user.id);
      const client = clients.find(c => c.id === clientId);
      if (client) setClientName(client.name);

      const docs = await getSharedDocuments(user.id, clientId as string);
      setDocuments(docs || []);
      
    } catch (error: any) {
      console.error('Error loading client documents:', error);
      Alert.alert('Error', 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    return '📁';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <ActivityIndicator color="#64FFDA" size="large" />
        <Text className="text-[#8892B0] mt-4">Accessing secure vault...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-5" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#112240] rounded-full border border-white/5">
          <ArrowLeft size={24} color="#64FFDA" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-2xl" numberOfLines={1}>{clientName}'s Vault</Text>
          <Text className="text-[#8892B0] text-sm">Shared secure documents</Text>
        </View>
        <ShieldAlert size={24} color="#64FFDA" />
      </View>

      {documents.length === 0 ? (
        <View className="bg-[#112240] border border-white/5 p-10 rounded-2xl items-center justify-center border-dashed mt-4">
          <FileText size={48} color="#1E293B" />
          <Text className="text-[#8892B0] mt-4 text-center font-medium">Vault is empty.</Text>
          <Text className="text-[#64748B] text-sm text-center mt-1">Client hasn't shared any documents yet.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {documents.map((doc) => (
            <View key={doc.id} className="bg-[#112240] border border-white/5 p-4 rounded-xl flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-10 h-10 bg-[#0A192F] rounded-lg items-center justify-center mr-3 border border-white/5">
                    <Text className="text-lg">{getFileIcon(doc.mime_type)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium text-base" numberOfLines={1}>{doc.file_name}</Text>
                  <Text className="text-[#8892B0] text-xs mt-0.5">{formatFileSize(doc.size_bytes)} • {new Date(doc.created_at).toLocaleDateString()}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => Alert.alert('Download', `Downloading ${doc.file_name}...`)} className="bg-[#64FFDA]/10 p-3 rounded-xl border border-[#64FFDA]/20">
                <Download size={20} color="#64FFDA" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}