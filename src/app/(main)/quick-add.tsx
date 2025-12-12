import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mic, Send, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../shared/context/AuthContext';
import { processNaturalLanguageTransaction } from '../../services/dataService';

export default function QuickAddScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || !user) return;
    setProcessing(true);
    try {
        await processNaturalLanguageTransaction(user.id, input);
        Alert.alert("Success", "Transaction processed by AI and saved.", [
            { text: "Done", onPress: () => router.back() }
        ]);
    } catch (error: any) {
        Alert.alert("AI Error", "Could not understand. Try 'Spent $15 at Target'.");
    } finally {
        setProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#8892B0" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Quick Add</Text>
      </View>

      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
            <View className="w-20 h-20 bg-[#64FFDA]/10 rounded-full items-center justify-center mb-4 border border-[#64FFDA]/20 shadow-[0_0_30px_rgba(100,255,218,0.2)]">
                <Sparkles size={40} color="#64FFDA" />
            </View>
            <Text className="text-white text-2xl font-bold text-center">Describe it.</Text>
            <Text className="text-[#8892B0] text-center mt-2 px-8 leading-6">
                "Spent $45 on gas" or "Received $1000 salary".{'\n'}Our AI handles the rest.
            </Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="bg-[#112240] p-2 rounded-3xl border border-white/10 flex-row items-center">
                <TextInput 
                    className="flex-1 text-white text-lg p-4 font-medium"
                    placeholder="Type or use dictation..."
                    placeholderTextColor="#475569"
                    value={input}
                    onChangeText={setInput}
                    autoFocus
                    multiline
                />
                {processing ? (
                    <View className="p-4"><ActivityIndicator color="#64FFDA" /></View>
                ) : (
                    <TouchableOpacity 
                        onPress={handleSubmit}
                        className={`p-4 rounded-full ${input.trim() ? 'bg-[#64FFDA]' : 'bg-white/5'}`}
                    >
                        {input.trim() ? <Send size={24} color="#0A192F" /> : <Mic size={24} color="#8892B0" />}
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}