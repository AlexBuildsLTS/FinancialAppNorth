import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { getDocuments, exportDocumentsToCSV } from '../../services/dataService';
import { DocumentItem } from '@/types';
import { FileText, Download, Share2 } from 'lucide-react-native';

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ... [Existing loadData logic] ...
  useEffect(() => {
      if (user) {
          getDocuments(user.id).then(setDocs).finally(() => setLoading(false));
      }
  }, [user]);

  const handleExport = async () => {
    if (!user) return;
    try {
        await exportDocumentsToCSV(user.id);
    } catch (e: any) {
        Alert.alert("Export Failed", e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="p-6 border-b border-white/5 flex-row justify-between items-center">
        <Text className="text-white text-3xl font-bold">Documents</Text>
        
        {/* EXPORT BUTTON */}
        <TouchableOpacity onPress={handleExport} className="bg-[#112240] p-3 rounded-xl border border-white/10">
            <Share2 size={20} color="#64FFDA" />
        </TouchableOpacity>
      </View>

      {/* ... [List Implementation] ... */}
      <FlatList
        data={docs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
            <View className="flex-row items-center p-4 border-b border-white/5">
                <FileText size={24} color="#8892B0" />
                <View className="ml-4 flex-1">
                    <Text className="text-white font-medium">{item.name}</Text>
                    <Text className="text-[#8892B0] text-xs">{new Date(item.date).toLocaleDateString()}</Text>
                </View>
            </View>
        )}
      />
    </SafeAreaView>
  );
}