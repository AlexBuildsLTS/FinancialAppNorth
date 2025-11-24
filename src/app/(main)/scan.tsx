import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { X, Zap } from 'lucide-react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
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
      ) : (
        <SafeAreaView className="flex-1 bg-[#0A192F] p-6">
          <Image source={{ uri: photo }} className="flex-1 rounded-2xl mb-6 bg-black" resizeMode="contain" />
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => setPhoto(null)} className="flex-1 py-4 bg-[#112240] rounded-xl items-center border border-white/10">
              <Text className="text-white font-bold">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { Alert.alert('Success', 'Processed!'); router.back(); }} className="flex-1 py-4 bg-[#64FFDA] rounded-xl items-center">
              <Text className="text-[#0A192F] font-bold">Use Photo</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}