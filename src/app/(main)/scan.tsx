import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, TextInput 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Flashlight, Check, Repeat, FileText, ScanLine } from 'lucide-react-native';
import { supabase } from '../../lib/supabase'; 
import { dataService } from '../../services/dataService'; 
import { useAuth } from '../../shared/context/AuthContext';

export default function ScanReceiptScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Camera State
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  
  // Processing State
  const [photo, setPhoto] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Result State (The AI's best guess)
  const [scanResult, setScanResult] = useState<any>(null);

  // Editable Form State (User corrections)
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  // Auto-fill form when AI result arrives
  useEffect(() => {
    if (scanResult) {
        setMerchant(scanResult.merchant || 'Unknown Merchant');
        setAmount(scanResult.amount ? String(scanResult.amount) : '');
        setDate(scanResult.date || new Date().toISOString().split('T')[0]);
        setCategory(scanResult.category || 'Uncategorized');
    }
  }, [scanResult]);

  if (!permission) return <View className="flex-1 bg-black" />;
  
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A192F] items-center justify-center p-6">
        <ScanLine size={64} color="#64FFDA" />
        <Text className="mt-6 text-xl font-bold text-center text-white">Camera Access Required</Text>
        <Text className="text-[#8892B0] text-center mt-2 mb-8 px-4 leading-6">
          NorthFinance uses advanced computer vision to extract data from your receipts instantly.
        </Text>
        <TouchableOpacity 
          onPress={requestPermission} 
          className="bg-[#64FFDA] px-8 py-4 rounded-full"
          style={{ elevation: 4, shadowColor: '#64FFDA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
        >
          <Text className="text-[#0A192F] font-bold text-lg">Grant Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
          skipProcessing: true 
        });
        
        if (photoData?.base64) {
            setPhoto(photoData.uri);
            analyzeReceipt(photoData.base64);
        }
      } catch (e) {
        Alert.alert("Camera Error", "Failed to capture image.");
      }
    }
  };

  const analyzeReceipt = async (base64: string) => {
    setProcessing(true);
    try {
        // 1. Call Titan 2 AI (Edge Function)
        const { data, error } = await supabase.functions.invoke('ocr-scan', {
            body: { imageBase64: base64, userId: user?.id }
        });

        if (error) throw error;
        
        // 2. Set Result (The Edge Function already returns clean JSON)
        setScanResult(data);

    } catch (e: any) {
        console.error("OCR Error:", e);
        Alert.alert(
            "Scan Failed", 
            "Could not read receipt. Please enter details manually.",
            [{ text: "OK", onPress: () => setScanResult({ merchant: '', amount: 0 }) }]
        );
    } finally {
        setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!amount || isNaN(parseFloat(amount))) {
        Alert.alert("Invalid Amount", "Please enter a valid number.");
        return;
    }
    
    try {
        await dataService.createTransaction({
            amount: -Math.abs(parseFloat(amount)), // Expenses are negative
            description: merchant,
            category: category,
            date: date,
            type: 'expense'
        }, user.id);

        Alert.alert("Success", "Receipt saved to ledger.", [
            { text: "Done", onPress: () => router.back() }
        ]);
    } catch (e) {
        Alert.alert("Save Error", "Could not save transaction to database.");
    }
  };

  // --- REVIEW UI ---
  if (photo) {
      return (
        <SafeAreaView className="flex-1 bg-[#0A192F]">
            <View className="flex-1 p-6">
                <Text className="mb-6 text-2xl font-bold text-center text-white">Review Scan</Text>
                
                <View className="items-center mb-8">
                    <Image source={{ uri: photo }} className="w-32 h-48 border rounded-xl border-white/10" resizeMode="contain" />
                    {processing && (
                        <View className="absolute inset-0 items-center justify-center bg-black/60 rounded-xl">
                            <ActivityIndicator size="large" color="#64FFDA" />
                            <Text className="text-[#64FFDA] text-xs font-bold mt-2">ANALYZING...</Text>
                        </View>
                    )}
                </View>

                {/* Form */}
                <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 gap-5 shadow-xl">
                    <View>
                        <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1 tracking-wider">Merchant</Text>
                        <TextInput 
                            value={merchant} 
                            onChangeText={setMerchant}
                            placeholder="Store Name"
                            placeholderTextColor="#475569"
                            className="pb-2 text-xl font-bold text-white border-b border-white/10" 
                        />
                    </View>
                    
                    <View>
                        <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1 tracking-wider">Total Amount</Text>
                        <View className="flex-row items-center pb-2 border-b border-white/10">
                            <Text className="text-[#64FFDA] text-2xl font-bold mr-1">$</Text>
                            <TextInput 
                                value={amount} 
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="0.00"
                                placeholderTextColor="#475569"
                                className="text-[#64FFDA] text-3xl font-bold flex-1" 
                            />
                        </View>
                    </View>

                    <View className="flex-row justify-between gap-4">
                        <View className="flex-1">
                            <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1 tracking-wider">Date</Text>
                            <TextInput 
                                value={date} 
                                onChangeText={setDate}
                                className="pb-1 font-medium text-white border-b border-white/10" 
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[#8892B0] text-xs font-bold uppercase mb-1 tracking-wider">Category</Text>
                            <TextInput 
                                value={category} 
                                onChangeText={setCategory}
                                className="pb-1 font-medium text-white border-b border-white/10" 
                            />
                        </View>
                    </View>
                </View>

                {/* Actions */}
                {!processing && (
                    <View className="justify-end flex-1 gap-3 mt-6">
                        <TouchableOpacity 
                            onPress={handleSave} 
                            className="bg-[#64FFDA] p-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-[#64FFDA]/20"
                        >
                            <Check size={20} color="#0A192F" />
                            <Text className="text-[#0A192F] font-bold text-lg ml-2">Confirm & Save</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => { setPhoto(null); setScanResult(null); }} 
                            className="bg-[#112240] p-4 rounded-xl flex-row items-center justify-center border border-white/10"
                        >
                            <Repeat size={20} color="#8892B0" />
                            <Text className="ml-2 text-lg font-bold text-white">Retake Photo</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
      );
  }

  // --- CAMERA UI ---
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="absolute z-10 top-12 left-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2.5 bg-black/40 rounded-full backdrop-blur-md">
            <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="absolute z-10 top-12 right-6">
        <TouchableOpacity onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')} className="p-2.5 bg-black/40 rounded-full backdrop-blur-md">
            <Flashlight size={24} color={flash === 'on' ? '#64FFDA' : 'white'} />
        </TouchableOpacity>
      </View>

      <CameraView 
        ref={cameraRef} 
        style={{ flex: 1 }} 
        facing={facing}
        enableTorch={flash === 'on'}
      />

      {/* Capture Controls */}
      <View className="absolute bottom-0 flex-row items-center justify-center w-full gap-10 p-8 pt-20 pb-12 bg-gradient-to-t from-black/80 to-transparent">
         <TouchableOpacity onPress={() => router.push('/(main)/quick-add')} className="items-center justify-center w-12 h-12 border rounded-full bg-white/10 backdrop-blur-md border-white/20">
            <FileText size={20} color="white" />
         </TouchableOpacity>
         
         <TouchableOpacity 
            onPress={takePicture}
            className="items-center justify-center w-20 h-20 border-4 border-white rounded-full shadow-2xl"
         >
            <View className="w-16 h-16 bg-white rounded-full" />
         </TouchableOpacity>

         <View className="w-12" /> {/* Spacer for balance */}
      </View>
    </SafeAreaView>
  );
}