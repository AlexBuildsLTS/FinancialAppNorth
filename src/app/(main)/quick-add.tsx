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
            { text: "Done", onPress: () => router.push('/(main)/finances') }
        ]);
        setInput('');
    } catch (error: any) {
        Alert.alert("Try 'Spent $5 at Lidl'.");
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
        <Text className="text-white font-bold text-xl">Smart Ledger</Text>
      </View>

      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-10">
            <View className="w-24 h-24 bg-[#64FFDA]/10 rounded-full items-center justify-center mb-6 border border-[#64FFDA]/20 shadow-lg">
                <Sparkles size={48} color="#64FFDA" />
            </View>
            <Text className="text-white text-3xl font-extrabold text-center mb-2">Just Say It</Text>
            <Text className="text-[#8892B0] text-center px-4 leading-6 text-base">
                "300SEK I LIDL"{'\n'}
                "Fick 100 SEK swish"{'\n'}
            </Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="bg-[#112240] p-3 rounded-3xl border border-white/10 flex-row items-end shadow-xl">
                <TextInput 
                    className="flex-1 text-white text-lg p-4 font-medium max-h-32"
                    placeholder="Type here..."
                    placeholderTextColor="#475569"
                    value={input}
                    onChangeText={setInput}
                    autoFocus
                    multiline
                />
                {processing ? (
                    <View className="p-4 bg-[#64FFDA]/10 rounded-full m-1">
                        <ActivityIndicator color="#64FFDA" />
                    </View>
                ) : (
                    <TouchableOpacity 
                        onPress={handleSubmit}
                        disabled={!input.trim()}
                        className={`p-4 rounded-full m-1 ${input.trim() ? 'bg-[#64FFDA]' : 'bg-white/5'}`}
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