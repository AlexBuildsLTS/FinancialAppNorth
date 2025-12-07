import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, SafeAreaView, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { X, Zap, Check, Edit3 } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { DocumentService } from '../../services/documentService';
import { TransactionService } from '../../services/transactionService';

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [documentPath, setDocumentPath] = useState<string>('');
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission) return <View className="flex-1 bg-[#0A192F]" />;

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A192F] items-center justify-center p-6">
        <Text className="text-white text-center mb-4">We need camera access to scan receipts.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-[#64FFDA] px-6 py-3 rounded-lg">
          <Text className="text-[#0A192F] font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        if (result) setPhoto(result.uri);
      } catch (e) {
        Alert.alert('Error', 'Failed to capture photo');
      }
    }
  };

  const processImage = async () => {
    if (!photo || !user) return;

    setProcessing(true);
    try {
      // Upload to Supabase Storage
      const document = await DocumentService.uploadDocument(
        user.id,
        photo,
        `receipt_${Date.now()}.jpg`,
        'receipt'
      );

      setDocumentPath(document.file_path);

      // Trigger OCR
      const ocrResult = await DocumentService.processReceiptAI(document.file_path);

      setExtractedData(ocrResult);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process image');
      setPhoto(null);
    } finally {
      setProcessing(false);
    }
  };

  const createTransactionFromOCR = async () => {
    if (!extractedData || !user) return;

    try {
      await TransactionService.createTransaction({
        amount: -Math.abs(extractedData.total_amount || 0),
        description: extractedData.merchant_name || 'Scanned Receipt',
        category: extractedData.category || 'Other',
        date: extractedData.date || new Date().toISOString().split('T')[0],
        type: 'expense'
      }, user.id);

      Alert.alert('Success', 'Transaction created successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create transaction');
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      
      {!photo ? (
        <CameraView 
          ref={cameraRef} 
          style={{ flex: 1 }} 
          facing="back"
          enableTorch={flash === 'on'}
        >
          <SafeAreaView className="flex-1 justify-between p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/50 items-center justify-center rounded-full">
                <X size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}
                className={`w-10 h-10 items-center justify-center rounded-full ${flash === 'on' ? 'bg-[#64FFDA]' : 'bg-black/50'}`}
              >
                <Zap size={20} color={flash === 'on' ? '#0A192F' : 'white'} fill={flash === 'on' ? '#0A192F' : 'none'} />
              </TouchableOpacity>
            </View>

            {/* Overlay Guide */}
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
              <View className="w-64 h-96 border-2 border-[#64FFDA]/50 rounded-2xl bg-transparent relative">
                 {/* Corner markers */}
                 <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#64FFDA] -mt-1 -ml-1" />
                 <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#64FFDA] -mt-1 -mr-1" />
                 <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#64FFDA] -mb-1 -ml-1" />
                 <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#64FFDA] -mb-1 -mr-1" />
              </View>
            </View>

            {/* Capture Button */}
            <View className="items-center mb-8">
              <TouchableOpacity onPress={takePicture} className="w-20 h-20 rounded-full border-4 border-white/30 items-center justify-center">
                <View className="w-16 h-16 bg-white rounded-full" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      ) : processing ? (
        <SafeAreaView className="flex-1 bg-[#0A192F] items-center justify-center p-6">
          <ActivityIndicator size="large" color="#64FFDA" />
          <Text className="text-white text-lg mt-4">Processing receipt...</Text>
          <Text className="text-[#8892B0] text-center mt-2">Extracting text and analyzing data</Text>
        </SafeAreaView>
      ) : extractedData ? (
        <SafeAreaView className="flex-1 bg-[#0A192F] p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">Verify Details</Text>
            <TouchableOpacity onPress={() => { setExtractedData(null); setPhoto(null); }}>
              <X size={24} color="#8892B0" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <View className="bg-[#112240] p-4 rounded-xl mb-6">
              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Merchant</Text>
              <TextInput
                value={extractedData.merchant_name || ''}
                onChangeText={(text) => setExtractedData({...extractedData, merchant_name: text})}
                className="bg-[#0A192F] border border-white/5 rounded-lg p-3 text-white"
                placeholder="Enter merchant name"
                placeholderTextColor="#475569"
              />
            </View>

            <View className="bg-[#112240] p-4 rounded-xl mb-6">
              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Amount</Text>
              <TextInput
                value={extractedData.total_amount?.toString() || ''}
                onChangeText={(text) => setExtractedData({...extractedData, total_amount: parseFloat(text) || 0})}
                className="bg-[#0A192F] border border-white/5 rounded-lg p-3 text-white"
                placeholder="0.00"
                placeholderTextColor="#475569"
                keyboardType="decimal-pad"
              />
            </View>

            <View className="bg-[#112240] p-4 rounded-xl mb-6">
              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Date</Text>
              <TextInput
                value={extractedData.date || ''}
                onChangeText={(text) => setExtractedData({...extractedData, date: text})}
                className="bg-[#0A192F] border border-white/5 rounded-lg p-3 text-white"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#475569"
              />
            </View>

            <View className="bg-[#112240] p-4 rounded-xl mb-6">
              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Category</Text>
              <TextInput
                value={extractedData.category || ''}
                onChangeText={(text) => setExtractedData({...extractedData, category: text})}
                className="bg-[#0A192F] border border-white/5 rounded-lg p-3 text-white"
                placeholder="Food, Transport, etc."
                placeholderTextColor="#475569"
              />
            </View>
          </ScrollView>

          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => { setExtractedData(null); setPhoto(null); }} className="flex-1 py-4 bg-[#112240] rounded-xl items-center border border-white/10">
              <Text className="text-white font-bold">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={createTransactionFromOCR} className="flex-1 py-4 bg-[#64FFDA] rounded-xl items-center">
              <Text className="text-[#0A192F] font-bold">Create Transaction</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView className="flex-1 bg-[#0A192F] p-6">
          <Image source={{ uri: photo }} className="flex-1 rounded-2xl mb-6 bg-black" resizeMode="contain" />
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => setPhoto(null)} className="flex-1 py-4 bg-[#112240] rounded-xl items-center border border-white/10">
              <Text className="text-white font-bold">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={processImage} className="flex-1 py-4 bg-[#64FFDA] rounded-xl items-center">
              <Text className="text-[#0A192F] font-bold">Process Receipt</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}