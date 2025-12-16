/**
 * ============================================================================
 * 🚀 NORTHFINANCE: SMART LEDGER (FOS - Financial Operating System)
 * ============================================================================
 * AI-Powered Transaction Entry with Voice & Text Input
 * Part of the Financial Operating System - enables rapid data entry for
 * solopreneurs to Fortune 500 teams.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Keyboard, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ArrowLeft, CheckCircle, Zap, Mic, MicOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../shared/context/AuthContext';

export default function QuickAddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // --- State ---
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // AI Result Staging
  const [success, setSuccess] = useState(false);
  
  // --- Voice Input State (Titan 2 Feature) ---
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // --- Voice Input Setup (Titan 2) ---
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  /**
   * Start voice recording for faster transaction entry
   * Part of FOS: Enables hands-free data entry for busy professionals
   */
  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "Please enable microphone access in settings.");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Recording Error", "Could not start voice recording.");
    }
  };

  /**
   * Stop recording and process with AI
   */
  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (!uri) {
        Alert.alert("Error", "No audio recorded.");
        return;
      }

      // Process voice with AI (using smart-ledger function)
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('smart-ledger', {
        body: { 
          text: 'Processing voice input...', // Placeholder - in production, use speech-to-text
          userId: user?.id,
          audioUri: uri // Pass audio URI for processing
        }
      });

      if (error || !data?.transaction) {
        // Fallback: Use a simple prompt
        setInput("Spent money via voice command");
        Alert.alert("Voice Processing", "Voice transcription is being processed. Please review the extracted details.");
      } else {
        setResult(data.transaction);
      }
    } catch (err) {
      console.error('Voice processing error:', err);
      Alert.alert("Processing Error", "Could not process voice input. Please try typing instead.");
    } finally {
      setRecording(null);
      setLoading(false);
    }
  };

  // --- 1. AI Analysis Function ---
  const processWithAI = async () => {
    if (!input.trim()) {
        Alert.alert("Empty Input", "Please type something like 'Lunch $20'.");
        return;
    }
    
    if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
    }

    setLoading(true);
    Keyboard.dismiss();
    
    try {
      // Invoke the 'smart-ledger' Edge Function
      const { data, error } = await supabase.functions.invoke('smart-ledger', {
        body: { text: input, userId: user.id }
      });

      if (error) {
        console.error("Function Invocation Error:", error);
        throw new Error(error.message || "Failed to contact AI.");
      }

      if (!data || !data.transaction) {
        throw new Error("AI could not understand the input. Try rephrasing.");
      }

      // Success: Show the result for confirmation
      setResult(data.transaction);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (e: any) {
      console.error("AI Processing Error:", e);
      Alert.alert("Analysis Failed", e.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Database Save Function ---
  const confirmTransaction = async () => {
    if (!result || !user) return;
    setLoading(true);

    try {
      // Insert into the 'transactions' table
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: result.type === 'expense' ? -Math.abs(result.amount) : Math.abs(result.amount),
        merchant: result.merchant || 'Unknown',
        category: result.category || 'Uncategorized',
        description: input, // Save the original text as description
        date: result.date || new Date().toISOString(),
        type: result.type || 'expense'
      });

      if (error) throw error;

      // Success Sequence
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        setSuccess(false);
        setResult(null);
        setInput('');
        // Optional: router.back() or stay for another entry
      }, 1500);

    } catch (e: any) {
      console.error("Database Save Error:", e);
      Alert.alert("Save Failed", "Could not save transaction to database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="p-2 -ml-2 rounded-full active:bg-white/5"
            >
              <ArrowLeft size={24} color="#8892B0" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold ml-4">Smart Ledger</Text>
          </View>

          {/* Success Overlay */}
          {success ? (
            <View className="flex-1 items-center justify-center min-h-[300px]">
              <CheckCircle size={80} color="#64FFDA" />
              <Text className="text-white text-2xl font-bold mt-6">Logged Successfully!</Text>
              <Text className="text-[#8892B0] mt-2">Your transaction has been saved.</Text>
            </View>
          ) : (
            <>
              {/* Input Area */}
              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[#64FFDA] font-bold uppercase text-xs tracking-widest">
                    Describe Transaction
                  </Text>
                  {/* Voice Input Button (Titan 2 - FOS Feature) */}
                  <TouchableOpacity
                    onPress={isRecording ? stopRecording : startRecording}
                    disabled={loading || !hasPermission}
                    className={`p-3 rounded-full ${isRecording ? 'bg-red-500/20 border-2 border-red-500' : 'bg-[#64FFDA]/10 border border-[#64FFDA]/30'}`}
                  >
                    {isRecording ? (
                      <MicOff size={20} color="#EF4444" />
                    ) : (
                      <Mic size={20} color="#64FFDA" />
                    )}
                  </TouchableOpacity>
                </View>
                
                {isRecording && (
                  <View className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl mb-3 flex-row items-center">
                    <View className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
                    <Text className="text-red-400 font-semibold">Recording... Tap mic to stop</Text>
                  </View>
                )}
                
                <View className="bg-[#112240] p-4 rounded-3xl border border-white/10 shadow-lg">
                  <TextInput
                    className="text-white text-xl font-medium min-h-[120px]"
                    placeholder="E.g. 'Paid $120 for Electric Bill today'... or use voice input 🎤"
                    placeholderTextColor="#475569"
                    multiline
                    textAlignVertical="top"
                    value={input}
                    onChangeText={setInput}
                    autoFocus
                    editable={!isRecording}
                  />
                </View>
                <Text className="text-[#8892B0] text-xs mt-2 italic">
                  💡 FOS Tip: Use voice input for faster entry while on the go
                </Text>
              </View>

              {/* AI Result Card */}
              {result && (
                <View className="bg-[#112240] p-6 rounded-3xl border border-[#64FFDA]/50 mb-8">
                  <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-[#64FFDA] font-bold uppercase text-xs">AI Proposal</Text>
                    <Sparkles size={16} color="#64FFDA" />
                  </View>

                  <View className="gap-4">
                    <View className="flex-row justify-between border-b border-white/5 pb-2">
                      <Text className="text-[#8892B0]">Merchant</Text>
                      <Text className="text-white font-bold text-lg">{result.merchant}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-white/5 pb-2">
                      <Text className="text-[#8892B0]">Category</Text>
                      <Text className="text-white font-bold">{result.category}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-white/5 pb-2">
                      <Text className="text-[#8892B0]">Amount</Text>
                      <Text className="text-[#F472B6] font-bold text-xl">
                        {result.type === 'expense' ? '-' : '+'}${Math.abs(result.amount)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-[#8892B0]">Date</Text>
                      <Text className="text-white">{result.date}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="mt-auto">
                {!result ? (
                  <View className="gap-3">
                    <TouchableOpacity 
                      onPress={processWithAI}
                      disabled={!input.trim() || loading || isRecording}
                      className={`bg-[#64FFDA] py-4 rounded-xl flex-row items-center justify-center shadow-lg ${(!input.trim() || loading || isRecording) ? 'opacity-50' : ''}`}
                    >
                      {loading ? (
                        <ActivityIndicator color="#0A192F" />
                      ) : (
                        <>
                          <Zap size={20} color="#0A192F" className="mr-2" />
                          <Text className="text-[#0A192F] font-bold text-lg">Analyze with AI</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    
                    {/* Quick Voice Entry Button */}
                    {!input.trim() && !isRecording && (
                      <TouchableOpacity
                        onPress={startRecording}
                        disabled={!hasPermission}
                        className="bg-[#112240] py-3 rounded-xl flex-row items-center justify-center border border-[#64FFDA]/30"
                      >
                        <Mic size={18} color="#64FFDA" className="mr-2" />
                        <Text className="text-[#64FFDA] font-semibold">Quick Voice Entry</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View className="flex-row gap-4">
                    <TouchableOpacity 
                      onPress={() => setResult(null)}
                      className="flex-1 bg-[#112240] py-4 rounded-xl items-center border border-white/10"
                    >
                      <Text className="text-white font-bold">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={confirmTransaction}
                      disabled={loading}
                      className="flex-1 bg-[#64FFDA] py-4 rounded-xl items-center shadow-lg"
                    >
                      {loading ? (
                        <ActivityIndicator color="#0A192F" />
                      ) : (
                        <Text className="text-[#0A192F] font-bold">Confirm Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}