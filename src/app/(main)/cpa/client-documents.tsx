import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, ArrowLeft, Download, ShieldAlert, Lock } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { getCpaClients } from '../../../services/dataService';
import { CpaService } from '../../../services/cpaService'; 

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
  const [clientName, setClientName] = useState('Client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [clientId, user]);

  const loadData = async () => {
    if (!user || !clientId) return;

    try {
      // 1. Verify Authorization
      const isAuthorized = await CpaService.isCpaForClient(user.id, clientId as string);
      if (!isAuthorized) {
        Alert.alert('Access Denied', 'You do not have permission to view this vault.');
        router.back();
        return;
      }

      // 2. Fetch Client Info
      const clients = await getCpaClients(user.id);
      const client = clients.find(c => c.id === clientId);
      if (client) setClientName(client.name);

      // 3. Fetch Documents (Using CPA Service for authorized access)
      const docsData = await CpaService.getSharedDocuments(user.id, clientId as string);
      const docs: ClientDocument[] = docsData.map((doc: any) => ({
        id: doc.id,
        file_name: doc.file_name,
        file_path: doc.file_path,
        mime_type: doc.mime_type,
        size_bytes: doc.size_bytes,
        created_at: doc.created_at,
        status: doc.status
      }));
      setDocuments(docs || []);
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to load vault.');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.includes('pdf')) return <FileText size={24} color="#F59E0B" />;
    if (mimeType?.includes('image')) return <FileText size={24} color="#60A5FA" />;
    return <FileText size={24} color="#8892B0" />;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <ActivityIndicator color="#64FFDA" size="large" />
        <Text className="text-[#8892B0] mt-4 font-medium">Accessing Secure Vault...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-6" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#112240] rounded-full border border-white/10">
          <ArrowLeft size={24} color="#64FFDA" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white" numberOfLines={1}>{clientName}'s Vault</Text>
          <View className="flex-row items-center mt-1">
             <Lock size={12} color="#64FFDA" className="mr-1" />
             <Text className="text-[#64FFDA] text-xs font-bold uppercase">End-to-End Encrypted</Text>
          </View>
        </View>
        <View className="bg-[#112240] p-3 rounded-full border border-white/5">
            <ShieldAlert size={24} color="#64FFDA" />
        </View>
      </View>

      {/* List */}
      {documents.length === 0 ? (
        <View className="bg-[#112240] border border-white/5 p-12 rounded-3xl items-center justify-center border-dashed">
          <View className="bg-[#0A192F] p-6 rounded-full mb-4">
             <Lock size={40} color="#8892B0" />
          </View>
          <Text className="text-lg font-bold text-white">Vault Empty</Text>
          <Text className="text-[#8892B0] text-center mt-2 px-4 leading-6">
            This client hasn't uploaded any documents yet.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {documents.map((doc) => (
            <View key={doc.id} className="bg-[#112240] border border-white/5 p-4 rounded-2xl flex-row items-center justify-between shadow-sm">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-12 h-12 bg-[#0A192F] rounded-xl items-center justify-center mr-4 border border-white/5">
                    {getFileIcon(doc.mime_type)}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-white" numberOfLines={1}>{doc.file_name}</Text>
                  <Text className="text-[#8892B0] text-xs mt-1 font-medium">
                    {(doc.size_bytes ? doc.size_bytes / 1024 : 0).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => Alert.alert('Download', `Downloading ${doc.file_name}...`)} 
                className="bg-[#64FFDA]/10 p-3 rounded-xl border border-[#64FFDA]/20 active:bg-[#64FFDA]/20"
              >
                <Download size={20} color="#64FFDA" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}