
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FileText, Plus, Download, ExternalLink } from 'lucide-react-native';
import { getDocuments } from '../../services/dataService';
import { useAuth } from '../../shared/context/AuthContext';
import { DocumentItem } from '@/types';

export default function DocumentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocs = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getDocuments(user.id);
      setDocuments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleOpen = (url: string) => {
    if (url) Linking.openURL(url);
    else Alert.alert("Error", "File URL not found.");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen options={{ headerTitle: 'Documents', headerStyle: { backgroundColor: '#0A192F' }, headerTintColor: '#fff' }} />
      
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <FileText size={48} color="#8892B0" />
              <Text className="text-[#8892B0] mt-4">No documents uploaded yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => {
                if (typeof item.url === 'string' && item.url !== '') {
                  handleOpen(item.url);
                } else {
                  Alert.alert("Error", "File URL not found.");
                }
              }}
         
              className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-10 h-10 rounded-lg bg-[#64FFDA]/10 items-center justify-center">
                  <FileText size={20} color="#64FFDA" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold" numberOfLines={1}>{item.name}</Text>
                  <Text className="text-[#8892B0] text-xs uppercase">{item.type} • {item.date}</Text>
                </View>
              </View>
              <ExternalLink size={20} color="#8892B0" />
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity 
        onPress={() => router.push('/scan')}
        className="absolute bottom-8 right-6 bg-[#64FFDA] px-6 py-4 rounded-full shadow-lg flex-row items-center gap-2"
      >
        <Plus size={24} color="#0A192F" />
        <Text className="text-[#0A192F] font-bold">Scan Receipt</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}