import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FileText, Clock, CheckCircle2, AlertTriangle, Trash2, UploadCloud } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { getUserDocuments, deleteDocument, ScannedDocument } from '@/services/documentService';
import ScreenContainer from '@/components/ScreenContainer';

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserDocuments(user.id);
      setDocuments(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchDocuments(); }, [fetchDocuments]));

  const handleDelete = (doc: ScannedDocument) => {
    Alert.alert('Delete Document', `Are you sure you want to delete ${doc.file_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteDocument(doc);
          fetchDocuments(); // Refresh the list
        } catch (error) {
          Alert.alert('Error', 'Failed to delete the document.');
        }
      }},
    ]);
  };
  
  const getStatusIcon = (status: ScannedDocument['status']) => {
      switch (status) {
          case 'completed': return <CheckCircle2 color={colors.success} size={16} />;
          case 'processing': return <Clock color={colors.warning} size={16} />;
          case 'error': return <AlertTriangle color={colors.error} size={16} />;
          default: return <Clock color={colors.textSecondary} size={16} />;
      }
  };

  const renderDocumentItem = ({ item }: { item: ScannedDocument }) => (
    <TouchableOpacity style={[styles.docItem, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: `https://<YOUR_SUPABASE_URL>/storage/v1/object/public/documents/${item.file_path}` }} style={styles.thumbnail} />
      <View style={styles.docInfo}>
        <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>{item.file_name}</Text>
        <Text style={[styles.docDate, { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString()}
        </Text>
         <View style={styles.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>{item.status}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
        <Trash2 color={colors.error} size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>My Documents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/camera')} style={styles.uploadButton}>
                <UploadCloud color={colors.primary} size={28} />
            </TouchableOpacity>
        </View>
        
        {loading ? (
            <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />
        ) : (
            <FlatList
                data={documents}
                renderItem={renderDocumentItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FileText size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You have no documents.</Text>
                        <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Tap the upload button to scan your first receipt or invoice.</Text>
                    </View>
                }
            />
        )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20 },
    title: { fontSize: 32, fontWeight: 'bold' },
    uploadButton: { padding: 8 },
    list: { paddingHorizontal: 16, paddingTop: 16 },
    docItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
    thumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#2A2A2A' },
    docInfo: { flex: 1 },
    docName: { fontSize: 16, fontWeight: 'bold' },
    docDate: { fontSize: 12, marginTop: 4 },
    statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    statusText: { fontSize: 12, textTransform: 'capitalize' },
    deleteButton: { padding: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, paddingHorizontal: 40, gap: 16 },
    emptyText: { fontSize: 20, fontWeight: 'bold' },
    emptySubText: { fontSize: 14, textAlign: 'center' },
});