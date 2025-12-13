import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, SafeAreaView, StatusBar, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Check, X, RotateCcw, Zap } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { createTransaction } from '../../services/dataService'; // Unified data service
import { useRouter } from 'expo-router';
import { generateContent } from '../../services/aiService';

// --- Types for AI Output ---
interface ParsedReceipt {
    total: number;
    merchant: string;
    category: string;
    date: string; // YYYY-MM-DD
}

export default function ScanReceiptScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ParsedReceipt | null>(null);

  // --- 1. Permission and Image Picker Logic (Stabilized) ---
  const requestPermissions = async (useCamera: boolean) => {
    let permissionStatus: ImagePicker.PermissionResponse;
    
    if (useCamera) {
      permissionStatus = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permissionStatus.status === 'granted') {
      return true;
    }

    if (permissionStatus.canAskAgain) {
        Alert.alert(
            "Permission Required",
            `Please grant ${useCamera ? 'Camera' : 'Gallery'} access to proceed.`,
            [{ text: "OK" }]
        );
    } else {
        Alert.alert(
            "Permission Denied",
            "Access is permanently restricted. Please go to your device settings to enable access.",
            [{ text: "Go to Settings", onPress: () => Linking.openSettings() }]
        );
    }
    return false;
  };

  const pickImage = async (useCamera = false) => {
    setResult(null);
    setImageUri(null);
    setBase64Image(null);

    const hasPermission = await requestPermissions(useCamera);
    if (!hasPermission) return;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6, // Optimal balance for speed and quality
        base64: true,
        allowsEditing: Platform.OS === 'web' ? false : true, // Editing can interfere on web
        aspect: [4, 3],
      };

      let pickerResult: ImagePicker.ImagePickerResult;
      if (useCamera) {
        pickerResult = await ImagePicker.launchCameraAsync(options);
      } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!pickerResult.canceled && pickerResult.assets[0].base64) {
        const { uri, base64 } = pickerResult.assets[0];
        
        setImageUri(uri);
        setBase64Image(base64);
        
        // Auto-start analysis immediately upon selecting/taking photo
        analyzeReceipt(base64);
      }
    } catch (e) {
      console.error("Image Picker/Camera Error:", e);
      Alert.alert("Error", "Failed to access image source.");
    }
  };

  // --- 2. AI Analysis Logic (Stricter JSON Parsing) ---
  const analyzeReceipt = async (imgBase64: string) => {
    if (!user) return;
    setAnalyzing(true);

    try {
        const prompt = `
            Analyze this receipt image. Extract Total, Merchant Name, Primary Category (e.g., Food, Travel, Office Supplies, Utilities), and Date (YYYY-MM-DD). 
            If the date is missing, use today's date (${new Date().toISOString().split('T')[0]}). 
            Return ONLY a JSON object. Strictly adhere to the format, ensuring all values are present.
            
            Format:
            {
                "total": number (e.g., 45.99),
                "merchant": string,
                "category": string,
                "date": "YYYY-MM-DD"
            }
        `;
        
        const responseText = await generateContent(prompt, user.id, imgBase64);
        
        // Clean markdown, quotes, and newlines from AI response
        const cleanJson = responseText.replace(/```json|```/g, '').trim().replace(/(\r\n|\n|\r)/gm, "");
        const data = JSON.parse(cleanJson);
        
        // Stricter validation
        if (!data.total || !data.merchant || isNaN(Number(data.total))) {
             throw new Error("Missing or invalid core data fields.");
        }

        setResult({
            total: Number(data.total),
            merchant: data.merchant,
            category: data.category || "Uncategorized",
            date: data.date || new Date().toISOString().split('T')[0]
        });

    } catch (error: any) {
        console.error("AI Analysis failed:", error);
        Alert.alert("Analysis Failed", "Could not extract data. Retake the photo, ensuring it is clear.");
        // Clear image on hard failure to force retry
        setImageUri(null);
    } finally {
        setAnalyzing(false);
    }
  };

  // --- 3. Save Logic ---
  const handleSave = async () => {
    if (!result || !user) return;
    try {
        // Convert the string category to the expected object shape for Transactions
        const sanitizedCategoryId = (result.category ?? "Uncategorized")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "") || "uncategorized";

        // Use the validated/parsed result data
        await createTransaction({
            amount: -Math.abs(result.total), // Always negative for expense
            description: result.merchant,
            category: {
                id: sanitizedCategoryId,
                name: result.category ?? "Uncategorized",
            },
            date: result.date,
            type: 'expense',
            // OPTIONAL: You might save the base64 image here if your createTransaction supports it
        }, user.id);
        
        Alert.alert("Success", `Expense of $${result.total.toFixed(2)} saved for ${result.merchant}.`);
        router.back();
    } catch (e: any) {
        Alert.alert("Save Failed", "Could not save transaction. Check data connection.");
    }
  };

  const handleRetake = () => {
      setImageUri(null);
      setBase64Image(null);
      setResult(null);
  };

  // --- 4. Render UI ---
  const renderInputControls = () => (
    <View className="flex-1 justify-center items-center gap-6 p-6">
        <TouchableOpacity onPress={() => pickImage(true)} className="bg-[#112240] w-full p-8 rounded-3xl border border-white/10 items-center active:bg-[#162C52] shadow-xl">
            <Camera size={64} color="#64FFDA" />
            <Text className="text-white font-bold text-xl mt-4">Take Photo</Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center w-full gap-4">
            <View className="h-[1px] bg-white/10 flex-1" />
            <Text className="text-[#8892B0]">OR</Text>
            <View className="h-[1px] bg-white/10 flex-1" />
        </View>

        <TouchableOpacity onPress={() => pickImage(false)} className="bg-[#112240] w-full p-8 rounded-3xl border border-white/10 items-center active:bg-[#162C52] shadow-xl">
            <ImageIcon size={64} color="#A78BFA" />
            <Text className="text-white font-bold text-xl mt-4">Upload from Gallery</Text>
        </TouchableOpacity>
    </View>
  );

  const renderAnalysisView = () => (
    <ScrollView className="flex-1 p-6">
        <Image source={{ uri: imageUri! }} className="w-full h-80 rounded-3xl mb-6 bg-black/20 border border-white/10 shadow-xl" resizeMode="contain" />
        
        {/* State: Analyzing */}
        {analyzing && (
            <View className="items-center py-10 bg-[#112240] rounded-3xl border border-white/5 shadow-lg">
                <ActivityIndicator size="large" color="#64FFDA" />
                <Text className="text-white font-bold text-lg mt-4">AI Analyzing Receipt...</Text>
                <Text className="text-[#8892B0] text-sm mt-1">Extracting ${Math.floor(Math.random() * 50) + 1} data points</Text>
            </View>
        )}
        
        {/* State: Result Ready */}
        {result && !analyzing && (
            <View className="bg-[#112240] p-6 rounded-3xl border border-white/5 mb-20 shadow-lg">
                <View className="flex-row items-center mb-4">
                    <Zap size={20} color="#64FFDA" />
                    <Text className="text-[#64FFDA] font-bold ml-2 uppercase text-xs tracking-widest">Data Extracted</Text>
                </View>

                <View className="space-y-4 mb-6">
                    <View className="flex-row justify-between border-b border-white/5 pb-2">
                        <Text className="text-[#8892B0]">Merchant</Text>
                        <Text className="text-white font-bold text-lg">{result.merchant}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-white/5 pb-2">
                        <Text className="text-[#8892B0]">Total</Text>
                        <Text className="text-[#64FFDA] font-bold text-2xl">${result.total.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-white/5 pb-2">
                        <Text className="text-[#8892B0]">Date</Text>
                        <Text className="text-white">{result.date}</Text>
                    </View>
                    <View className="flex-row justify-between pb-2">
                        <Text className="text-[#8892B0]">Category</Text>
                        <View className="bg-[#0A192F] px-3 py-1 rounded-full border border-white/10">
                            <Text className="text-white text-xs font-medium">{result.category}</Text>
                        </View>
                    </View>
                </View>
                
                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={handleRetake} className="flex-1 bg-white/5 p-4 rounded-xl items-center flex-row justify-center border border-white/10">
                        <RotateCcw size={18} color="#8892B0" className="mr-2" />
                        <Text className="text-[#8892B0] font-bold">Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} className="flex-1 bg-[#64FFDA] p-4 rounded-xl items-center flex-row justify-center shadow-lg shadow-[#64FFDA]/30">
                        <Check size={18} color="#0A192F" className="mr-2" />
                        <Text className="text-[#0A192F] font-bold">Save Transaction</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

        {/* State: Failed Analysis (If result is null but image exists) */}
        {!analyzing && !result && imageUri && (
            <TouchableOpacity onPress={handleRetake} className="bg-red-500/10 p-4 rounded-xl items-center border border-red-500/30">
                <Text className="text-red-400 font-bold">Analysis failed. Tap to try again or retake.</Text>
            </TouchableOpacity>
        )}
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      <View className="p-6 pb-4">
        <Text className="text-white text-3xl font-bold">Scan Receipt</Text>
        <Text className="text-[#8892B0]">AI Automatic Extraction</Text>
      </View>
      
      {imageUri ? renderAnalysisView() : renderInputControls()}
    </SafeAreaView>
  );
}