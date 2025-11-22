import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { GlassCard } from '@/shared/components/GlassCard';
import { Send, Bot } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AIChatScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>AI Assistant</Text>
      </View>

      {/* Chat Area (Placeholder for now) */}
      <View style={styles.chatArea}>
        <GlassCard style={{ padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.botIcon, { backgroundColor: theme.colors.primary }]}>
              <Bot size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: 14, lineHeight: 20 }}>
                Hello! I can help you analyze your spending, categorize transactions, or answer financial questions. How can I help today?
              </Text>
            </View>
          </View>
        </GlassCard>
      </View>      {/* Chat Messages */}
      <FlatList
        data={[]} // Replace with your chat messages data
        renderItem={({ item }) => (
          <Text style={{ color: theme.colors.textPrimary }}>{item}</Text> // Customize message rendering
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
      

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <View style={[styles.inputBar, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
          <TextInput 
            placeholder="Ask a question..." 
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', 
              color: theme.colors.textPrimary 
            }]}
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}>
            <Send size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  title: { fontSize: 20, fontWeight: '700' },
  chatArea: { flex: 1, padding: 20 },
  botIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  inputBar: { padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center', borderTopWidth: 1 },
  input: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 16, fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});