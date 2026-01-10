import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Added missing import
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Zap, X, Camera, RefreshCw, CheckCircle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';

/**
 * @component OCRScanner
 * @description High-performance receipt capture.
 * Integrates with Gemini OCR for automated ledger entry.
 */
export default function OCRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  // Handle Permission loading state
  if (!permission) return <View className="flex-1 bg-black" />;

  // Requesting permissions UI
  if (!permission.granted) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 p-6 bg-slate-950">
        <Zap size={48} color="#22d3ee" className="mb-4" />
        <Text className="mb-2 text-xl font-bold text-center text-white">
          Camera Access Required
        </Text>
        <Text className="mb-8 text-center text-slate-400">
          NorthFinance needs camera access to scan receipts and automate your
          bookkeeping.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="px-8 py-4 bg-cyan-500 rounded-2xl active:opacity-80"
        >
          <Text className="font-black tracking-widest uppercase text-slate-950">
            Grant Access
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        skipProcessing: true, // Performance optimization for instant capture
      });

      setCapturedImage(photo.uri);
      processReceipt(photo.base64);
    } catch (error) {
      console.error('Capture Error:', error);
      Alert.alert('Camera Error', 'Failed to capture image.');
    }
  };

  const processReceipt = async (base64: string) => {
    setIsProcessing(true);
    try {
      // Invoke the Edge Function for OCR processing
      const { data, error } = await supabase.functions.invoke('ocr-scan', {
        body: { image: base64 },
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Receipt Analyzed',
        `Merchant: ${data.merchant}\nAmount: $${data.amount}\nCategory: ${data.category}`,
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => setCapturedImage(null),
          },
          {
            text: 'Save to Ledger',
            onPress: () => router.push('/(main)/finances'),
          },
        ]
      );
    } catch (e) {
      console.error('OCR Error:', e);
      Alert.alert(
        'Analysis Failed',
        'Could not read receipt. Please ensure lighting is good.'
      );
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {!capturedImage ? (
        <CameraView ref={cameraRef} className="flex-1" facing="back">
          <SafeAreaView className="justify-between flex-1 p-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center justify-center w-12 h-12 border rounded-full bg-black/40 border-white/10"
            >
              <X size={24} color="white" />
            </TouchableOpacity>

            <View className="items-center pb-12">
              <BlurView
                intensity={20}
                tint="dark"
                className="px-6 py-3 mb-8 overflow-hidden border rounded-2xl border-white/20"
              >
                <Text className="text-xs font-bold tracking-widest text-center text-white uppercase">
                  Scan Receipt
                </Text>
              </BlurView>

              <TouchableOpacity
                onPress={takePicture}
                className="items-center justify-center w-20 h-20 transition-transform border-4 border-white rounded-full active:scale-95"
              >
                <View className="w-16 h-16 bg-white border-2 border-black rounded-full" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      ) : (
        <View className="flex-1">
          <Image
            source={{ uri: capturedImage }}
            className="flex-1"
            resizeMode="cover"
          />
          {isProcessing && (
            <BlurView
              intensity={90}
              tint="dark"
              className="absolute inset-0 items-center justify-center"
            >
              <ActivityIndicator size="large" color="#22d3ee" />
              <Text className="text-cyan-400 font-black mt-4 uppercase tracking-[4px]">
                AI Extraction...
              </Text>
              <Text className="mt-2 text-xs italic text-slate-400">
                Gemini Pro Vision at work
              </Text>
            </BlurView>
          )}
        </View>
      )}
    </View>
  );
}
