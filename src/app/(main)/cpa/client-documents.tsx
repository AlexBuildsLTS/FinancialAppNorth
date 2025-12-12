import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, ArrowLeft, Download, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { isCpaForClient, getSharedDocuments, getCpaClients } from '../../../services/dataService'; // Unified Service

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
      // Verify CPA has access to this client
      const isAuthorized = await isCpaForClient(user.id, clientId as string);
      if (!isAuthorized) {
        Alert.alert('Access Denied', 'You do not have permission to view this client\'s documents');
        router.back();
        return;
      }

      // Get client name
      const clients = await getCpaClients(user.id);
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setClientName(client.name);
      }

      // Get shared documents using Unified Service
      const docs = await getSharedDocuments(user.id, clientId as string);
      setDocuments(docs || []);
    } catch (error: any) {
      console.error('Error loading client documents:', error);
      Alert.alert('Error', 'Failed to load client documents');
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
    return '📄';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <ActivityIndicator color="#64FFDA" />
        <Text className="text-white mt-4">Loading secure vault...</Text>
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
          <Text className="text-white font-bold text-2xl">{clientName}'s Documents</Text>
          <Text className="text-[#8892B0] text-sm">Shared document vault</Text>
        </View>
        <ShieldAlert size={24} color="#64FFDA" />
      </View>

      {documents.length === 0 ? (
        <View className="bg-[#112240] border border-white/5 p-8 rounded-xl items-center border-dashed">
          <FileText size={40} color="#112240" />
          <Text className="text-[#8892B0] mt-4 text-center">No documents shared yet.</Text>
          <Text className="text-[#8892B0] text-sm text-center">Client documents will appear here when uploaded.</Text>
        </View>
      ) : (
        <View className="gap-4">
          {documents.map((doc) => (
            <View
              key={doc.id}
              className="bg-[#112240] border border-white/5 p-4 rounded-xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">{getFileIcon(doc.mime_type)}</Text>
                <View className="flex-1">
                  <Text className="text-white font-medium" numberOfLines={1}>
                    {doc.file_name}
                  </Text>
                  <Text className="text-[#8892B0] text-sm">
                    {formatFileSize(doc.size_bytes)} • {new Date(doc.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Download', `Downloading ${doc.file_name}...`);
                }}
                className="bg-[#64FFDA]/10 p-3 rounded-lg"
              >
                <Download size={18} color="#64FFDA" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}