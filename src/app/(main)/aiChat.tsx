import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, StatusBar, Alert 
} from 'react-native';
import { Send, Bot, User, ArrowLeft, Sparkles, Mic, Key, AlignLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../shared/context/AuthContext';
import { generateContent } from '../../services/aiService'; 
// Ensure this path matches where you put the logic from dataService.ts
import { processNaturalLanguageTransaction } from '../../services/dataService';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // --- MODE SWITCHER STATE ---
  const [mode, setMode] = useState<'chat' | 'ledger'>('chat');

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'model', 
      text: `Hello ${user?.name || 'there'}! I am NorthAI. You can chat with me here, or switch to "Smart Ledger" to log expenses.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // --- LEDGER STATE ---
  const [ledgerInput, setLedgerInput] = useState('');
  const [ledgerProcessing, setLedgerProcessing] = useState(false);

  // --- CHAT LOGIC ---
  const handleSendChat = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await generateContent(userText, user?.id);
      
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: `⚠️ Error: ${error.message}` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (mode === 'chat') {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, mode]);

  // --- LEDGER LOGIC ---
  const handleLedgerSubmit = async () => {
    if (!ledgerInput.trim() || !user) return;
    setLedgerProcessing(true);
    try {
        await processNaturalLanguageTransaction(user.id, ledgerInput);
        Alert.alert("Success", "Transaction processed and saved.", [
            { text: "View Finances", onPress: () => router.push('/(main)/finances') },
            { text: "Stay Here", style: "cancel", onPress: () => setLedgerInput('') }
        ]);
    } catch (error: any) {
        Alert.alert("AI Error", "Could not understand. Try 'Spent $15 at Target'.");
    } finally {
        setLedgerProcessing(false);
    }
  };

  const renderChatItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-[#64FFDA]/10 items-center justify-center mr-2 border border-[#64FFDA]/20">
            <Bot size={16} color="#64FFDA" />
          </View>
        )}
        
        <View 
          className={`max-w-[80%] p-4 rounded-2xl ${
            isUser 
              ? 'bg-[#64FFDA] rounded-tr-sm' 
              : 'bg-[#112240] rounded-tl-sm border border-white/5'
          }`}
        >
          <Text className={`text-base ${isUser ? 'text-[#0A192F] font-bold' : 'text-white'}`}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View className="flex-row items-center justify-between p-4 border-b border-white/5 bg-[#0A192F]">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 -ml-2 rounded-full active:bg-white/10">
            <ArrowLeft size={24} color="#8892B0" />
            </TouchableOpacity>
            <View>
            <Text className="text-white text-lg font-bold flex-row items-center">
                North AI <Sparkles size={14} color="#64FFDA" />
            </Text>
            <Text className="text-[#8892B0] text-xs">Financial Intelligence</Text>
            </View>
        </View>
        
        {/* API Key Shortcut */}
        <TouchableOpacity onPress={() => router.push('/(main)/settings/ai-keys')} className="p-2 bg-[#112240] rounded-full border border-white/10">
            <Key size={18} color="#64FFDA" />
        </TouchableOpacity>
      </View>

      {/* MODE TOGGLE TABS */}
      <View className="flex-row p-1 mx-4 mt-4 bg-[#112240] rounded-xl border border-white/5">
        <TouchableOpacity 
            onPress={() => setMode('chat')}
            className={`flex-1 py-2 rounded-lg items-center ${mode === 'chat' ? 'bg-[#64FFDA]' : 'bg-transparent'}`}
        >
            <Text className={`font-bold ${mode === 'chat' ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={() => setMode('ledger')}
            className={`flex-1 py-2 rounded-lg items-center ${mode === 'ledger' ? 'bg-[#64FFDA]' : 'bg-transparent'}`}
        >
            <Text className={`font-bold ${mode === 'ledger' ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>Smart Ledger</Text>
        </TouchableOpacity>
      </View>

      {/* === MODE 1: CHAT INTERFACE === */}
      {mode === 'chat' && (
        <>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderChatItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                className="flex-1"
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View className="p-4 bg-[#112240] border-t border-white/5 flex-row items-end">
                <TextInput
                    className="flex-1 bg-[#0A192F] text-white p-4 rounded-2xl border border-white/10 text-base max-h-32"
                    placeholder="Ask about your finances..."
                    placeholderTextColor="#475569"
                    value={input}
                    onChangeText={setInput}
                    multiline
                    editable={!isTyping}
                />
                <TouchableOpacity 
                    onPress={handleSendChat} 
                    disabled={!input.trim() || isTyping}
                    className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${
                    input.trim() ? 'bg-[#64FFDA]' : 'bg-white/10'
                    }`}
                >
                    {isTyping ? (
                    <ActivityIndicator color="#0A192F" />
                    ) : (
                    <Send size={20} color={input.trim() ? '#0A192F' : '#8892B0'} />
                    )}
                </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
      )}

      {/* === MODE 2: SMART LEDGER (QUICK ADD) === */}
      {mode === 'ledger' && (
        <View className="flex-1 justify-center p-6">
            <View className="items-center mb-10">
                <View className="w-24 h-24 bg-[#64FFDA]/10 rounded-full items-center justify-center mb-6 border border-[#64FFDA]/20 shadow-lg">
                    <Sparkles size={48} color="#64FFDA" />
                </View>
                <Text className="text-white text-3xl font-extrabold text-center mb-2">Just Say It</Text>
                <Text className="text-[#8892B0] text-center px-4 leading-6 text-base">
                   "-350 SEK I Lidl"{'\n'}
                "+100 SEK Swish"{'\n'}
                </Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View className="bg-[#112240] p-3 rounded-3xl border border-white/10 flex-row items-end shadow-xl">
                    <TextInput 
                        className="flex-1 text-white text-lg p-4 font-medium max-h-32"
                        placeholder="Type or dictate..."
                        placeholderTextColor="#475569"
                        value={ledgerInput}
                        onChangeText={setLedgerInput}
                        multiline
                    />
                    {ledgerProcessing ? (
                        <View className="p-4 bg-[#64FFDA]/10 rounded-full m-1">
                            <ActivityIndicator color="#64FFDA" />
                        </View>
                    ) : (
                        <TouchableOpacity 
                            onPress={handleLedgerSubmit}
                            disabled={!ledgerInput.trim()}
                            className={`p-4 rounded-full m-1 ${ledgerInput.trim() ? 'bg-[#64FFDA]' : 'bg-white/5'}`}
                        >
                            {ledgerInput.trim() ? <Send size={24} color="#0A192F" /> : <Mic size={24} color="#8892B0" />}
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
      )}

    </SafeAreaView>
  );
}