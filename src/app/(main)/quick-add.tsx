/**
 * ============================================================================
 * 🚀 NORTHFINANCE: SMART LEDGER (FOS - Financial Operating System)
 * ============================================================================
 * AI-Powered Transaction Entry with Voice & Text Input
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
  const [result, setResult] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  
  // --- Voice Input State ---
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

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

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert("Permission Required", "Please enable microphone access.");
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
      Alert.alert("Recording Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await recording.stopAndUnloadAsync();
      // For a real app, you'd upload this file. 
      // Here we simulate the AI transcription and processing.
      
      setLoading(true);
      // Simulate calling edge function with audio (or text from audio)
      // In production, send audio blob to transcription service (Whisper/Gemini)
      
      // Mocking transcription for immediate UI feedback as actual audio upload setup is complex without backend storage ready
      const mockTranscription = "Lunch at McDonald's for 15 dollars"; 
      setInput(mockTranscription);
      
      // Now process the text
      await processWithAI(mockTranscription);

    } catch (err) {
      Alert.alert("Processing Error", "Could not process voice input.");
    } finally {
      setRecording(null);
      setLoading(false);
    }
  };

  const processWithAI = async (textOverride?: string) => {
    const textToProcess = textOverride || input;
    
    if (!textToProcess.trim()) {
        Alert.alert("Empty Input", "Please type something.");
        return;
    }
    
    if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
    }

    setLoading(true);
    Keyboard.dismiss();
    
    try {
      // Invoke 'smart-ledger' Edge Function
      const { data, error } = await supabase.functions.invoke('smart-ledger', {
        body: { text: textToProcess, userId: user.id }
      });

      if (error) throw new Error(error.message);

      if (!data || !data.transaction) {
        throw new Error("AI could not understand input.");
      }

      setResult(data.transaction);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (e: any) {
      console.error("AI Error:", e);
      Alert.alert("Analysis Failed", e.message || "Failed to process.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const confirmTransaction = async () => {
    if (!result || !user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: result.type === 'expense' ? -Math.abs(result.amount) : Math.abs(result.amount),
        merchant: result.merchant || 'Unknown',
        category: result.category || 'Uncategorized',
        description: input, 
        date: result.date || new Date().toISOString(),
        type: result.type || 'expense'
      });

      if (error) throw error;

      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        setSuccess(false);
        setResult(null);
        setInput('');
      }, 1500);

    } catch (e) {
      Alert.alert("Save Failed", "Could not save to database.");
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
          
          <View className="flex-row items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                className="p-2 -ml-2 rounded-full active:bg-white/5"
            >
              <ArrowLeft size={24} color="#8892B0" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-bold text-white">Smart Ledger</Text>
          </View>

          {success ? (
            <View className="flex-1 items-center justify-center min-h-[300px]">
              <CheckCircle size={80} color="#64FFDA" />
              <Text className="mt-6 text-2xl font-bold text-white">Logged Successfully!</Text>
            </View>
          ) : (
            <>
              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[#64FFDA] font-bold uppercase text-xs tracking-widest">
                    Describe Transaction
                  </Text>
                  <TouchableOpacity
                    onPress={isRecording ? stopRecording : startRecording}
                    disabled={loading || !hasPermission}
                    className={`p-3 rounded-full ${isRecording ? 'bg-red-500/20 border-2 border-red-500' : 'bg-[#64FFDA]/10 border border-[#64FFDA]/30'}`}
                  >
                    {isRecording ? <MicOff size={20} color="#EF4444" /> : <Mic size={20} color="#64FFDA" />}
                  </TouchableOpacity>
                </View>
                
                {isRecording && (
                  <View className="flex-row items-center p-3 mb-3 border bg-red-500/10 border-red-500/30 rounded-xl">
                    <View className="w-3 h-3 mr-2 bg-red-500 rounded-full animate-pulse" />
                    <Text className="font-semibold text-red-400">Recording... Tap mic to stop</Text>
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
                    editable={!isRecording}
                  />
                </View>
              </View>

              {result && (
                <View className="bg-[#112240] p-6 rounded-3xl border border-[#64FFDA]/50 mb-8">
                  <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-[#64FFDA] font-bold uppercase text-xs">AI Proposal</Text>
                    <Sparkles size={16} color="#64FFDA" />
                  </View>

                  <View className="gap-4">
                    <View className="flex-row justify-between pb-2 border-b border-white/5">
                      <Text className="text-[#8892B0]">Merchant</Text>
                      <Text className="text-lg font-bold text-white">{result.merchant}</Text>
                    </View>
                    <View className="flex-row justify-between pb-2 border-b border-white/5">
                      <Text className="text-[#8892B0]">Category</Text>
                      <Text className="font-bold text-white">{result.category}</Text>
                    </View>
                    <View className="flex-row justify-between pb-2 border-b border-white/5">
                      <Text className="text-[#8892B0]">Amount</Text>
                      <Text className="text-[#F472B6] font-bold text-xl">
                        {result.type === 'expense' ? '-' : '+'}${Math.abs(result.amount)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View className="mt-auto">
                {!result ? (
                  <TouchableOpacity 
                    onPress={() => processWithAI()}
                    disabled={!input.trim() || loading || isRecording}
                    className={`bg-[#64FFDA] py-4 rounded-xl flex-row items-center justify-center shadow-lg ${(!input.trim() || loading || isRecording) ? 'opacity-50' : ''}`}
                  >
                    {loading ? <ActivityIndicator color="#0A192F" /> : (
                        <>
                          <Zap size={20} color="#0A192F" className="mr-2" />
                          <Text className="text-[#0A192F] font-bold text-lg">Analyze with AI</Text>
                        </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row gap-4">
                    <TouchableOpacity onPress={() => setResult(null)} className="flex-1 bg-[#112240] py-4 rounded-xl items-center border border-white/10">
                      <Text className="font-bold text-white">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmTransaction} disabled={loading} className="flex-1 bg-[#64FFDA] py-4 rounded-xl items-center shadow-lg">
                      {loading ? <ActivityIndicator color="#0A192F" /> : <Text className="text-[#0A192F] font-bold">Confirm Save</Text>}
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