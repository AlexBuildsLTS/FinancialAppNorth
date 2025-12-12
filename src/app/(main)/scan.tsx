import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Check, X, RotateCcw } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { generateContent } from '../../shared/services/geminiService'; // New robust service
import { createTransaction } from '../../services/dataService'; // Unified data service
import { useRouter } from 'expo-router';

export default function ScanReceiptScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async (useCamera = false) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5, // Lower quality for faster AI upload
        base64: true,
        allowsEditing: true,
      };

      let result;
      if (useCamera) {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0].base64) {
        setImage(result.assets[0].uri);
        setBase64(result.assets[0].base64);
        analyzeReceipt(result.assets[0].base64);
      }
    } catch (e) {
      Alert.alert("Error", "Could not capture image.");
    }
  };

  const analyzeReceipt = async (imgBase64: string) => {
    if (!user) return;
    setAnalyzing(true);
    setResult(null);

    try {
        const prompt = `
            Analyze this receipt image. Extract the following details and return ONLY a valid JSON object. 
            Do not include markdown formatting (like \`\`\`json).
            Format:
            {
                "total": number (positive value),
                "merchant": string,
                "category": string (e.g., "Food", "Transport", "Shopping", "Utilities"),
                "date": "YYYY-MM-DD"
            }
        `;
        
        const responseText = await generateContent(prompt, user.id, imgBase64);
        
        // Clean markdown if AI adds it despite instructions
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);
        
        // Basic validation
        if (!data.total && !data.merchant) throw new Error("Incomplete data extracted");

        setResult(data);

    } catch (error: any) {
        console.error("Analysis failed", error);
        Alert.alert("Analysis Failed", "Could not extract receipt data. Please retake the photo.");
        setImage(null);
    } finally {
        setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    try {
        // Create Expense Transaction
        // Note: passing category name string is safe with our new dataService
        await createTransaction({
            amount: -Math.abs(result.total),
            description: result.merchant || "Receipt Scan",
            category: result.category || "Uncategorized",
            date: result.date || new Date().toISOString(),
            type: 'expense'
        }, user.id);
        
        Alert.alert("Success", "Receipt saved to transactions!");
        router.back();
    } catch (e: any) {
        Alert.alert("Save Failed", e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      <View className="p-6 pb-2">
        <Text className="text-white text-3xl font-bold">Scan Receipt</Text>
        <Text className="text-[#8892B0]">AI Automatic Extraction</Text>
      </View>
      
      {!image ? (
        <View className="flex-1 justify-center items-center gap-6 p-6">
            <TouchableOpacity onPress={() => pickImage(true)} className="bg-[#112240] w-full p-8 rounded-3xl border border-white/10 items-center active:bg-[#162C52]">
                <Camera size={64} color="#64FFDA" />
                <Text className="text-white font-bold text-xl mt-4">Take Photo</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center w-full gap-4">
                <View className="h-[1px] bg-white/10 flex-1" />
                <Text className="text-[#8892B0]">OR</Text>
                <View className="h-[1px] bg-white/10 flex-1" />
            </View>

            <TouchableOpacity onPress={() => pickImage(false)} className="bg-[#112240] w-full p-8 rounded-3xl border border-white/10 items-center active:bg-[#162C52]">
                <ImageIcon size={64} color="#A78BFA" />
                <Text className="text-white font-bold text-xl mt-4">Upload from Gallery</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 p-6">
            <Image source={{ uri: image }} className="w-full h-96 rounded-3xl mb-6 bg-black/20 border border-white/10" resizeMode="contain" />
            
            {analyzing ? (
                <View className="items-center py-10 bg-[#112240] rounded-3xl border border-white/5">
                    <ActivityIndicator size="large" color="#64FFDA" />
                    <Text className="text-white font-bold text-lg mt-4">Analyzing Receipt...</Text>
                    <Text className="text-[#8892B0] text-sm mt-1">Extracting merchant & total</Text>
                </View>
            ) : result ? (
                <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 mb-20 shadow-lg">
                    <View className="flex-row items-center mb-4">
                        <Check size={20} color="#4ADE80" />
                        <Text className="text-[#4ADE80] font-bold ml-2 uppercase text-xs tracking-widest">Extraction Successful</Text>
                    </View>

                    <View className="space-y-4 mb-6">
                        <View className="flex-row justify-between border-b border-white/5 pb-2">
                            <Text className="text-[#8892B0]">Merchant</Text>
                            <Text className="text-white font-bold text-lg">{result.merchant}</Text>
                        </View>
                        <View className="flex-row justify-between border-b border-white/5 pb-2">
                            <Text className="text-[#8892B0]">Total</Text>
                            <Text className="text-[#64FFDA] font-bold text-2xl">${result.total}</Text>
                        </View>
                        <View className="flex-row justify-between border-b border-white/5 pb-2">
                            <Text className="text-[#8892B0]">Date</Text>
                            <Text className="text-white">{result.date || 'Today'}</Text>
                        </View>
                        <View className="flex-row justify-between pb-2">
                            <Text className="text-[#8892B0]">Category</Text>
                            <View className="bg-[#0A192F] px-3 py-1 rounded-full border border-white/10">
                                <Text className="text-white text-xs">{result.category}</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => setImage(null)} className="flex-1 bg-white/5 p-4 rounded-xl items-center flex-row justify-center">
                            <RotateCcw size={18} color="#8892B0" className="mr-2" />
                            <Text className="text-[#8892B0] font-bold">Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} className="flex-1 bg-[#64FFDA] p-4 rounded-xl items-center flex-row justify-center shadow-lg">
                            <Check size={18} color="#0A192F" className="mr-2" />
                            <Text className="text-[#0A192F] font-bold">Save Transaction</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity onPress={() => setImage(null)} className="bg-red-500/10 p-4 rounded-xl items-center border border-red-500/30">
                    <Text className="text-red-400 font-bold">Retry Analysis</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}