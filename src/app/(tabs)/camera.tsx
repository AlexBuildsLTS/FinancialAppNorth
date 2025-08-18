import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Camera as CameraIcon, Image as ImageIcon, FileText, Download, Zap, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ScannedDocument } from '@/types';
import { exportToCSV } from '@/utils/fileUtils';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter(); // Initialize useRouter
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [scannedDocuments, setScannedDocuments] = useState<ScannedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const styles = createStyles(colors);

  // Mock OCR function - in production, this would use a real OCR service
  const extractTextFromImage = async (imageUri: string): Promise<string> => {
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted text for demonstration
    return `INVOICE
Date: ${new Date().toLocaleDateString()}
Invoice #: INV-2025-001
Amount: $1,250.00
Description: Professional Services
Tax: $125.00
Total: $1,375.00
Payment Terms: Net 30`;
  };

  const takePicture = async () => {
    if (!showCamera) {
      setShowCamera(true);
      return;
    }

    try {
      setIsProcessing(true);
      
      // For demo purposes, we'll use a mock image
      const mockImageUri = 'https://via.placeholder.com/400x600/CCCCCC/000000?text=Invoice+Document';
      
      const extractedText = await extractTextFromImage(mockImageUri);
      
      const newDocument: ScannedDocument = {
        id: `doc_${Date.now()}`,
        clientId: user?.role === 'Professional Accountant' ? 'current_client' : user?.id || '',
        fileName: `scanned_${Date.now()}.jpg`,
        filePath: mockImageUri,
        extractedText,
        createdAt: new Date().toISOString(),
        status: 'processed'
      };

      setScannedDocuments(prev => [newDocument, ...prev]);
      setSelectedImage(mockImageUri);
      setShowCamera(false);
      
      Alert.alert('Success', 'Document scanned and text extracted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIsProcessing(true);
      try {
        const extractedText = await extractTextFromImage(result.assets[0].uri);
        
        const newDocument: ScannedDocument = {
          id: `doc_${Date.now()}`,
          clientId: user?.role === 'Professional Accountant' ? 'current_client' : user?.id || '',
          fileName: `imported_${Date.now()}.jpg`,
          filePath: result.assets[0].uri,
          extractedText,
          createdAt: new Date().toISOString(),
          status: 'processed'
        };

        setScannedDocuments(prev => [newDocument, ...prev]);
        setSelectedImage(result.assets[0].uri);
        
        Alert.alert('Success', 'Image processed and text extracted successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to process image');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleExportToCSV = (document: ScannedDocument) => {
    // Parse the extracted text into structured data
    const lines = document.extractedText.split('\n');
    const csvData = lines.map((line, index) => ({
      Line: index + 1,
      Content: line.trim(),
      Type: line.includes('$') ? 'Amount' : line.includes('Date:') ? 'Date' : 'Text'
    }));

    exportToCSV(csvData, `extracted_text_${document.id}`);
  };

  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={colors.textSecondary} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan documents and receipts.
          </Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      </ScreenContainer>
    );
  }

  if (showCamera) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <StatusBar style="light" />
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.scanFrame} />
            
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.flipButton} 
                onPress={() => setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'))}
              >
                <Text style={styles.controlButtonText}>Flip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickImage}
              >
                <ImageIcon size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Document Scanner</Text>
        <Text style={styles.headerSubtitle}>
          {user?.role === 'Professional Accountant' ? 'Scan client documents' : 'Scan your receipts and bills'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Card style={styles.actionCard}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={takePicture}>
                <CameraIcon size={32} color={colors.primary} />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <ImageIcon size={32} color={colors.primary} />
                <Text style={styles.actionButtonText}>Choose Image</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        {selectedImage && (
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <Card style={styles.previewCard}>
              <Text style={styles.cardTitle}>Last Scanned</Text>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Card>
            <View style={styles.documentsHeader}>
              <Text style={styles.cardTitle}>Scanned Documents</Text>
              <Text style={styles.documentsCount}>{scannedDocuments.length}</Text>
            </View>
            
            {scannedDocuments.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No documents scanned yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start by taking a photo or selecting an image
                </Text>
              </View>
            ) : (
              <View style={styles.documentsList}>
                {scannedDocuments.map((doc, index) => (
                  <View key={doc.id} style={styles.documentItem}>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{doc.fileName}</Text>
                      <Text style={styles.documentDate}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </Text>
                      <View style={styles.statusContainer}>
                        {doc.status === 'processed' ? (
                          <CheckCircle size={16} color={colors.success} />
                        ) : (
                          <AlertCircle size={16} color={colors.warning} />
                        )}
                        <Text style={[
                          styles.statusText,
                          { color: doc.status === 'processed' ? colors.success : colors.warning }
                        ]}>
                          {doc.status}
                        </Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.exportButton}
                      onPress={() => handleExportToCSV(doc)}
                    >
                      <Download size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </Animated.View>

        {user?.role === 'Professional Accountant' && (
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <Card style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Zap size={24} color={colors.warning} />
                <Text style={styles.cardTitle}>AI Processing</Text>
              </View>
              <Text style={styles.aiDescription}>
                Use AI to automatically categorize and extract data from scanned documents.
                Configure your AI settings in the AI Assistant tab.
              </Text>
              <Button
                title="Configure AI Assistant"
                onPress={() => router.push('/ai-assistant' as any)}
                variant="outline"
                icon={Zap}
              />
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      gap: 20,
    },
    permissionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    permissionText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    cameraContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    camera: {
      flex: 1,
    },
    cameraOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    scanFrame: {
      position: 'absolute',
      top: '30%',
      left: '10%',
      right: '10%',
      height: '40%',
      borderWidth: 2,
      borderColor: '#fff',
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    cameraControls: {
      position: 'absolute',
      bottom: 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    flipButton: {
      padding: 15,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 25,
    },
    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureButtonInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
    },
    galleryButton: {
      padding: 15,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 25,
    },
    controlButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    actionCard: {
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    actionButton: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      minWidth: 120,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
    },
    previewCard: {
      marginBottom: 20,
    },
    previewImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      resizeMode: 'cover',
    },
    documentsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    documentsCount: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
      gap: 12,
    },
    emptyStateText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    documentsList: {
      gap: 12,
    },
    documentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    documentInfo: {
      flex: 1,
    },
    documentName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    documentDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    exportButton: {
      padding: 8,
    },
    aiCard: {
      marginTop: 20,
    },
    aiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    aiDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
  });
