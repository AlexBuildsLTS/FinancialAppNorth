import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  StatusBar,
  Alert,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Key, 
  ArrowLeft 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

// --- SERVICE IMPORTS ---
import { useAuth } from '../../shared/context/AuthContext';
import { generateContent } from '../../services/geminiService';
import { dataService } from '../../services/dataService';
import { FinancialBrain } from '../../services/financialBrain'; // Added for Titan 2 Intelligence
import { supabase } from '../../lib/supabase';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const SUGGESTION_CHIPS = [
  "Analyze my spending 📉",
  "How is my budget? 💰",
  "Predict next month 🔮",
  "Suggest savings 🌱"
];

export default function AIChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // --- STATE ---
  const [mode, setMode] = useState<'chat' | 'ledger'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ledger State
  const [ledgerInput, setLedgerInput] = useState('');
  const [ledgerProcessing, setLedgerProcessing] = useState(false);
  
  // Data Context State
  const [financialContext, setFinancialContext] = useState<any>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    loadFinancialContext();
    if (messages.length === 0) {
        setMessages([{
        id: 'welcome',
        text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am NorthAI. I can analyze your data or help you log expenses via the Smart Ledger.`,
        sender: 'ai',
        timestamp: new Date()
        }]);
    }
  }, []);

  const loadFinancialContext = async () => {
    if (!user) return;
    try {
      const [summary, txs, budgets] = await Promise.all([
        dataService.getFinancialSummary(user.id),
        dataService.getTransactions(user.id),
        dataService.getBudgets(user.id)
      ]);
      
      setFinancialContext({
        balance: summary.balance,
        income: summary.income,
        expense: summary.expense,
        recentTransactions: txs.slice(0, 5).map((t: any) => ({ amount: t.amount, category: t.category, date: t.date })),
        budgets: budgets.map((b: any) => ({ category: b.category_name, remaining: b.remaining }))
      });
    } catch (e) {
      console.error("Failed to load context for AI", e);
    }
  };

  const switchMode = (newMode: 'chat' | 'ledger') => {
    Haptics.selectionAsync();
    setMode(newMode);
  };

  // --- CHAT HANDLER (Fixed & Robust) ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !user) return;

    // 1. Add User Message UI
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      let response;
      const lowerText = textToSend.toLowerCase();

      // 2. Intelligent Routing (Titan 2 Logic)
      // If user asks for data analysis, use the "Financial Brain" context engine
      if (
        lowerText.includes('analyze') || 
        lowerText.includes('spending') || 
        lowerText.includes('budget') || 
        lowerText.includes('predict')
      ) {
          response = await FinancialBrain.askAdvisor(user.id, textToSend);
      } else {
          // Use standard general chat
          response = await generateContent(textToSend, user.id);
      }

      // 3. Add AI Message UI
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the financial brain. Please verify your connection or check your API keys in settings.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LEDGER HANDLER ---
  const handleLedgerSubmit = async () => {
    if (!ledgerInput.trim() || !user) return;

    Keyboard.dismiss();
    setLedgerProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error } = await supabase.functions.invoke('smart-ledger', {
        body: { text: ledgerInput, userId: user.id }
      });

      if (error) throw new Error(error.message);
      if (!data || !data.transaction) throw new Error("AI could not understand input.");

      const result = data.transaction;

      const { error: dbError } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: result.type === 'expense' ? -Math.abs(result.amount) : Math.abs(result.amount),
        merchant: result.merchant || 'Unknown',
        category: result.category || 'Uncategorized',
        description: ledgerInput, 
        date: result.date || new Date().toISOString(),
        type: result.type || 'expense'
      });

      if (dbError) throw dbError;
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Transaction Recorded", 
        `Logged: ${result.merchant} ($${Math.abs(result.amount)})`, 
        [
            { text: "View Finances", onPress: () => router.push('/(main)/finances') },
            { text: "Add Another", style: "cancel", onPress: () => setLedgerInput('') }
        ]
      );
      
      loadFinancialContext();

    } catch (error: any) {
      console.error("Ledger Error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Processing Failed", "Try a clearer format like: 'Spent 100 on Coffee'.");
    } finally {
      setLedgerProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A192F" />
      
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 pb-4 border-b border-white/5 bg-[#0A192F]">
        <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-white/5">
                <ArrowLeft size={24} color="#8892B0" />
            </TouchableOpacity>
            <View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-bold text-white">North AI</Text>
                    <Sparkles size={14} color="#64FFDA" />
                </View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-[#8892B0] text-xs font-medium">Financial Intelligence</Text>
                    {financialContext && (
                        <View className="bg-green-500/20 px-1.5 py-0.5 rounded">
                            <Text className="text-[8px] text-green-400 font-bold">LIVE</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
        
        <TouchableOpacity 
            onPress={() => router.push('/(main)/settings/ai-keys')} 
            className="p-2 bg-[#112240] rounded-full border border-white/10 active:bg-[#1d3557]"
        >
            <Key size={18} color="#64FFDA" />
        </TouchableOpacity>
      </View>

      {/* MODE TABS */}
      <View className="mx-4 mt-4 mb-2 p-1 bg-[#112240] rounded-xl border border-white/5 flex-row">
        <TouchableOpacity 
            onPress={() => switchMode('chat')}
            className={`flex-1 py-2 rounded-lg items-center justify-center flex-row gap-2 ${mode === 'chat' ? 'bg-[#64FFDA]' : 'bg-transparent'}`}
        >
            <Bot size={16} color={mode === 'chat' ? '#0A192F' : '#8892B0'} />
            <Text className={`font-bold text-sm ${mode === 'chat' ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={() => switchMode('ledger')}
            className={`flex-1 py-2 rounded-lg items-center justify-center flex-row gap-2 ${mode === 'ledger' ? 'bg-[#64FFDA]' : 'bg-transparent'}`}
        >
            <DollarSign size={16} color={mode === 'ledger' ? '#0A192F' : '#8892B0'} />
            <Text className={`font-bold text-sm ${mode === 'ledger' ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>Smart Ledger</Text>
        </TouchableOpacity>
      </View>

      {/* === CHAT MODE === */}
      {mode === 'chat' && (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            className="flex-1"
        >
            <ScrollView 
                ref={scrollViewRef}
                className="flex-1 px-4"
                contentContainerStyle={{ paddingVertical: 20 }}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                <View key={msg.id} className={`mb-6 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                    <View className="w-8 h-8 rounded-full bg-[#112240] items-center justify-center mr-3 border border-[#233554] mt-1">
                        <Bot size={16} color="#64FFDA" />
                    </View>
                    )}
                    
                    <View 
                    className={`px-5 py-3.5 rounded-2xl max-w-[80%] ${
                        msg.sender === 'user' 
                        ? 'bg-[#64FFDA] rounded-tr-sm' 
                        : 'bg-[#112240] border border-[#233554] rounded-tl-sm'
                    }`}
                    >
                    <Text className={`text-base leading-6 ${msg.sender === 'user' ? 'text-[#0A192F] font-medium' : 'text-[#E2E8F0]'}`}>
                        {msg.text}
                    </Text>
                    <Text className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-[#0A192F]/60' : 'text-[#8892B0]'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    </View>

                    {msg.sender === 'user' && (
                    <View className="w-8 h-8 rounded-full bg-[#112240] items-center justify-center ml-3 border border-[#233554] mt-1">
                        <User size={16} color="#8892B0" />
                    </View>
                    )}
                </View>
                ))}

                {isLoading && (
                <View className="flex-row justify-start mb-6 ml-11">
                    <View className="bg-[#112240] px-4 py-3 rounded-2xl rounded-tl-sm border border-[#233554] flex-row gap-2 items-center">
                    <ActivityIndicator size="small" color="#64FFDA" />
                    <Text className="text-[#8892B0] text-xs italic">Analyzing finances...</Text>
                    </View>
                </View>
                )}
            </ScrollView>

            {/* Suggestion Chips */}
            {messages.length < 3 && !isLoading && (
                <View className="px-4 py-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                        {SUGGESTION_CHIPS.map((chip, i) => (
                            <TouchableOpacity 
                                key={i} 
                                onPress={() => handleSend(chip)}
                                className="mr-2 bg-[#112240] px-4 py-2 rounded-full border border-white/10 active:bg-[#64FFDA]/20"
                            >
                                <Text className="text-[#64FFDA] text-xs font-medium">{chip}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View className="p-4 bg-[#0A192F] border-t border-white/5 pb-8">
                <View className="flex-row items-end bg-[#112240] rounded-2xl border border-white/10 p-1">
                    <TextInput
                        className="flex-1 text-white p-3 min-h-[50px] max-h-[120px] text-base"
                        placeholder="Ask NorthAI..."
                        placeholderTextColor="#475569"
                        value={input}
                        onChangeText={setInput}
                        multiline
                        textAlignVertical="center"
                    />
                    <TouchableOpacity 
                        onPress={() => handleSend()} 
                        disabled={!input.trim() || isLoading}
                        className={`m-1 w-10 h-10 rounded-xl items-center justify-center ${
                            input.trim() ? 'bg-[#64FFDA]' : 'bg-white/5'
                        }`}
                    >
                        <Send size={18} color={input.trim() ? '#0A192F' : '#8892B0'} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      )}

      {/* === SMART LEDGER MODE === */}
      {mode === 'ledger' && (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                <View className="items-center mb-12">
                    <View className="w-24 h-24 bg-[#64FFDA]/5 rounded-full items-center justify-center mb-6 border border-[#64FFDA]/20 shadow-lg shadow-[#64FFDA]/10">
                        <Sparkles size={40} color="#64FFDA" />
                    </View>
                    <Text className="mb-3 text-3xl font-bold text-center text-white">Smart Entry</Text>
                    <Text className="text-[#8892B0] text-center px-6 leading-6 text-base">
                        Describe your transaction naturally. I'll categorize and date it automatically.
                    </Text>
                </View>

                <View className="bg-[#112240] p-4 rounded-3xl border border-white/10 shadow-2xl">
                    <TextInput 
                        className="text-white text-xl font-medium min-h-[100px] mb-4"
                        placeholder="E.g., Spent 350 SEK at Lidl for groceries today..."
                        placeholderTextColor="#475569"
                        value={ledgerInput}
                        onChangeText={setLedgerInput}
                        multiline
                        autoFocus
                    />
                    <View className="flex-row items-center justify-end">
                        <Text className="text-[#475569] text-xs mr-auto">
                            {ledgerInput.length}/200
                        </Text>
                        
                        {ledgerProcessing ? (
                             <ActivityIndicator color="#64FFDA" className="mr-4" />
                        ) : (
                            <TouchableOpacity 
                                onPress={handleLedgerSubmit}
                                disabled={!ledgerInput.trim()}
                                className={`flex-row items-center px-5 py-3 rounded-full ${
                                    ledgerInput.trim() ? 'bg-[#64FFDA]' : 'bg-white/5'
                                }`}
                            >
                                <Text className={`font-bold mr-2 ${ledgerInput.trim() ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>
                                    Process
                                </Text>
                                <TrendingUp size={16} color={ledgerInput.trim() ? '#0A192F' : '#8892B0'} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View className="flex-row justify-center gap-4 mt-8">
                     <View className="items-center">
                        <View className="w-10 h-10 rounded-full bg-[#112240] items-center justify-center mb-2 border border-white/5">
                            <TrendingUp size={18} color="#8892B0" />
                        </View>
                        <Text className="text-[#8892B0] text-xs">Auto-Category</Text>
                     </View>
                     <View className="items-center">
                        <View className="w-10 h-10 rounded-full bg-[#112240] items-center justify-center mb-2 border border-white/5">
                            <Bot size={18} color="#8892B0" />
                        </View>
                        <Text className="text-[#8892B0] text-xs">AI Extraction</Text>
                     </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}