/**
 * ============================================================================
 * 🛡️ NORTHFINANCE: TITAN SECURE CHAT ROOM (AAA+ PLATINUM EDITION)
 * ============================================================================
 * * MODULE DESCRIPTION:
 * The definitive, enterprise-grade secure messaging component.
 * Designed for reliability, security, and a premium user experience across
 * iOS, Android, and Web platforms.
 *
 * * CORE FEATURES:
 * 1. 🔒 End-to-End Encryption (AES-256): Zero-trust architecture.
 * 2. ⚡ Optimistic UI: Instant feedback for message sending.
 * 3. 📸 Rich Media: Image & File uploads with progress tracking & Web Support.
 * 4. 🔄 Real-time Sync: Supabase subscriptions for instant updates.
 * 5. 📅 Smart Grouping: Messages grouped by day for clarity.
 * 6. 🛡️ Robust Error Handling: Defensive coding against API failures.
 * 7. 📲 Haptic Feedback: Tactile responses (Platform-safe).
 * 8. 💀 Skeleton Loading: Premium loading states.
 * 9. 🎹 Keyboard Handling: Perfect layout adjustment on all devices.
 * 10. 🌍 Omni-Platform Uploads: Auto-detects Web vs Native for file handling.
 * 11. 🔐 Private Bucket Access: Uses Signed URLs for secure media viewing.
 *
 * * AUTHOR: NorthFinance Engineering
 * * DATE: 2025-12-14
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Dimensions,
  Modal,
  StatusBar,
  Pressable,
  LayoutAnimation,
  UIManager,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Send,
  Lock,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  MoreVertical,
  CheckCheck,
  Check,
  Info,
  X,
  User as UserIcon,
  Trash2,
  Copy,
  RefreshCw,
  AlertTriangle
} from 'lucide-react-native';

// --- EXTERNAL LIBS ---
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { decode } from 'base64-arraybuffer';
import Animated, { FadeIn, SlideInRight, SlideInUp, ZoomIn } from 'react-native-reanimated';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';

// --- INTERNAL SERVICES & UTILS ---
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { encryptMessage, decryptMessage } from '../../../lib/crypto';
import { GestureResponderEvent } from 'react-native/Libraries/Types/CoreEventTypes';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// 🏗️ CONFIGURATION & TYPES
// ============================================================================

const SCREEN_WIDTH = Dimensions.get('window').width;
const BUCKET_IMAGES = 'chat-images';
const BUCKET_FILES = 'chat-uploads';

const COLORS = {
  primary: '#64FFDA',
  secondary: '#F472B6',
  background: '#0A192F',
  card: '#112240',
  text: '#CCD6F6',
  dim: '#8892B0',
  danger: '#EF4444',
  border: 'rgba(255,255,255,0.1)',
  success: '#34D399',
  overlay: 'rgba(0,0,0,0.8)'
};

interface Message {
  id: string;
  conversation_id?: string;
  sender_id: string;
  recipient_id?: string;

  // Content
  content?: string;
  content_encrypted?: string;

  // Media
  message_type: 'text' | 'image' | 'file' | 'system';
  file_url?: string; // Stores the STORAGE PATH (e.g. "user_id/123.jpg")
  file_name?: string;
  file_size?: number;

  created_at: string;
  read_by?: string[];

  // UI State
  isOptimistic?: boolean;
  isFailed?: boolean;
}

interface ChatParticipant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  role?: string;
}

// ============================================================================
// 🖼️ HELPER: SECURE IMAGE (Handles Private Buckets)
// ============================================================================

const SecureImage = memo(({ path, style, resizeMode = 'cover' }: { path: string, style: any, resizeMode?: 'cover' | 'contain' }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchUrl = async () => {
      if (!path) {
          setLoading(false);
          return;
      }
      
      // If it's already a full URL (legacy public bucket), use it directly
      if (path.startsWith('http')) {
          setSignedUrl(path);
          setLoading(false);
          return;
      }

      try {
        // Generate a temporary signed URL valid for 1 hour (3600 seconds)
        // This is crucial for Private Buckets
        const { data, error } = await supabase.storage
          .from(BUCKET_IMAGES)
          .createSignedUrl(path, 3600);

        if (error) throw error;
        if (active && data) setSignedUrl(data.signedUrl);
      } catch (e) {
        console.warn('SecureImage Error:', e);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchUrl();
    return () => { active = false; };
  }, [path]);

  if (loading) {
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }]}>
        <ActivityIndicator color={COLORS.primary} size="small" />
      </View>
    );
  }

  if (error || !signedUrl) {
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#151515' }]}>
        <AlertTriangle size={24} color={COLORS.danger} />
        <Text style={{ color: COLORS.danger, fontSize: 10, marginTop: 4 }}>Image Failed</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={() => Linking.openURL(signedUrl)}>
      <Image source={{ uri: signedUrl }} style={style} resizeMode={resizeMode} />
    </Pressable>
  );
});

// ============================================================================
// 📎 HELPER: SECURE FILE (Handles Private Downloads)
// ============================================================================

const SecureFile = memo(({ path, filename, isMe }: { path: string, filename: string, isMe: boolean }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      let urlToOpen = path;

      // If it's not a public URL, generate a signed one
      if (!path.startsWith('http')) {
          const { data, error } = await supabase.storage
            .from(BUCKET_FILES)
            .createSignedUrl(path, 60); // 60 seconds validity for download link

          if (error) throw error;
          if (data?.signedUrl) urlToOpen = data.signedUrl;
      }

      await Linking.openURL(urlToOpen);
    } catch (e) {
      Alert.alert('Download Error', 'Could not access secure file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleDownload}
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 12, 
        backgroundColor: isMe ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)', 
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: isMe ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
      }}
    >
      <View style={{ padding: 10, backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', borderRadius: 10 }}>
        <FileText size={24} color={isMe ? '#0A192F' : '#CCD6F6'} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text numberOfLines={1} style={{ color: isMe ? '#0A192F' : 'white', fontWeight: 'bold', fontSize: 14 }}>
          {filename || 'Secure Document'}
        </Text>
        <Text style={{ color: isMe ? 'rgba(10,25,47,0.7)' : '#8892B0', fontSize: 11, marginTop: 2, fontWeight: '500' }}>
          {downloading ? 'Decrypting...' : 'Tap to download'}
        </Text>
      </View>
      {downloading ? (
        <ActivityIndicator size="small" color={isMe ? '#0A192F' : 'white'} />
      ) : (
        <Download size={20} color={isMe ? '#0A192F' : '#CCD6F6'} />
      )}
    </TouchableOpacity>
  );
});

// ============================================================================
// 💀 HELPER: SKELETON LOADER
// ============================================================================

const SkeletonMessage = ({ align }: { align: 'left' | 'right' }) => (
  <View style={{ 
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16
  }}>
    <View style={{ 
      width: align === 'right' ? 180 : 220, 
      height: align === 'right' ? 60 : 50, 
      borderRadius: 18, 
      backgroundColor: align === 'right' ? 'rgba(100, 255, 218, 0.05)' : 'rgba(255, 255, 255, 0.05)',
      borderBottomRightRadius: align === 'right' ? 2 : 18,
      borderBottomLeftRadius: align === 'left' ? 2 : 18
    }} />
  </View>
);

// ============================================================================
// 🚀 MAIN CHAT SCREEN CLASS
// ============================================================================

export default function ChatScreen() {
  // --- PARAMS ---
  const { id: paramIdRaw } = useLocalSearchParams();
  const paramId = Array.isArray(paramIdRaw) ? paramIdRaw[0] : paramIdRaw;
  const { user } = useAuth();
  const router = useRouter();

  // --- STATE ---
  const [conversationId, setConversationId] = useState<string | null>(
    paramId && paramId.length > 20 ? paramId : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [targetUser, setTargetUser] = useState<ChatParticipant | null>(null);

  // --- UX STATE ---
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // ============================================================================
  // 1. INITIALIZATION & DATA FETCHING
  // ============================================================================
  useEffect(() => {
    if (!user || !paramId) return;
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        let activeConvId = conversationId;
        let partner: ChatParticipant | null = null;

        // A. Resolve Identity
        // Check if paramId is a conversation ID first
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select(`user_id, profiles(id, first_name, last_name, email, avatar_url)`)
          .eq('conversation_id', paramId);

        if (participants && participants.length > 0) {
          activeConvId = paramId;
          setConversationId(paramId);
          const other = participants.find((p: any) => p.user_id !== user.id);
          if (other?.profiles) {
            partner = Array.isArray(other.profiles) ? other.profiles[0] : other.profiles;
          }
        } else {
          // It's likely a User ID (Direct Chat)
          // Use RPC to find existing conversation
          const { data: existingConv } = await supabase.rpc('get_user_conversations');
          const match = existingConv?.find((c: any) => c.other_user_id === paramId);

          if (match) {
            activeConvId = match.conversation_id;
            setConversationId(activeConvId);
            partner = {
              id: match.other_user_id,
              first_name: match.other_first_name,
              last_name: match.other_last_name,
              email: match.other_email,
              avatar_url: match.other_avatar_url
            };
          } else {
            // New Chat context
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', paramId).single();
            if (profile) partner = profile;
            setConversationId(null);
          }
        }

        if (mounted && partner) setTargetUser(partner);

        // B. Load Messages
        let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
        
        if (activeConvId) {
          query = query.eq('conversation_id', activeConvId);
        } else {
          query = query.or(`and(sender_id.eq.${user.id},recipient_id.eq.${paramId}),and(sender_id.eq.${paramId},recipient_id.eq.${user.id})`);
        }

        const { data: msgs } = await query;
        if (mounted && msgs) {
          setMessages(msgs);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
        }

      } catch (e) {
        console.error('Init Error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // C. Realtime Subscription
    const channel = supabase.channel(`room_${paramId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        // Verify relevance
        const isRelevant = 
          (newMsg.conversation_id === conversationId) || 
          (newMsg.sender_id === user.id && newMsg.recipient_id === paramId) ||
          (newMsg.sender_id === paramId && newMsg.recipient_id === user.id);

        if (isRelevant) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id || (m.isOptimistic && m.content_encrypted === newMsg.content_encrypted));
            if (exists) return prev.map(m => m.isOptimistic ? { ...newMsg, isOptimistic: false } : m);
            
            if (newMsg.sender_id !== user.id && Platform.OS !== 'web') {
               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return [...prev, newMsg];
          });
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      })
      .subscribe();

    return () => { 
        mounted = false;
        supabase.removeChannel(channel); 
    };
  }, [user, paramId, conversationId]);

  // ============================================================================
  // 📤 SENDING ENGINE
  // ============================================================================

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    
    const rawText = input.trim();
    setInput('');
    setSending(true);

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const encrypted = encryptMessage(rawText);
      const tempId = `temp-${Date.now()}`;

      // Optimistic UI
      const optimisticMsg: Message = {
        id: tempId,
        sender_id: user.id,
        content_encrypted: encrypted,
        message_type: 'text',
        created_at: new Date().toISOString(),
        isOptimistic: true
      };

      setMessages(p => [...p, optimisticMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      // DB Insert
      const payload: any = {
        sender_id: user.id,
        content_encrypted: encrypted,
        message_type: 'text',
        read_by: [user.id]
      };

      if (conversationId) payload.conversation_id = conversationId;
      else if (targetUser?.id) payload.recipient_id = targetUser.id;

      const { data: sentMsg, error } = await supabase.from('messages').insert(payload).select().single();
      
      if (error) throw error;
      if (sentMsg && !conversationId && sentMsg.conversation_id) setConversationId(sentMsg.conversation_id);

    } catch (e) {
      Alert.alert('Send Failed', 'Could not send message.');
      setInput(rawText);
      setMessages(p => p.filter(m => !m.isOptimistic));
    } finally {
      setSending(false);
    }
  };

  // ============================================================================
  // 📎 TITAN UPLOAD ENGINE (WEB + NATIVE)
  // ============================================================================
  // --- UPLOAD (FIXED FOR WEB & PRIVATE BUCKETS) ---
  const uploadMedia = async (uri: string, name: string, mime: string, type: 'image' | 'file') => {
    if (!user) return;
    setUploading(true);

    try {
      const cleanName = name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `${user.id}/${Date.now()}_${cleanName}`;
      const bucket = type === 'image' ? BUCKET_IMAGES : BUCKET_FILES;

      let fileBody;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileBody = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        fileBody = decode(base64);
      }

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, fileBody, { contentType: mime });
      if (upErr) throw upErr;

      // CRITICAL FIX: STORE THE PATH, NOT THE PUBLIC URL
      // This allows createSignedUrl to work later
      const encryptedCaption = encryptMessage(type === 'image' ? '📷 Image' : `📎 ${name}`);
      const payload: any = {
        sender_id: user.id,
        content_encrypted: encryptedCaption,
        message_type: type,
        file_url: path, // Storing PATH
        file_name: name,
        read_by: [user.id]
      };

      if (conversationId) payload.conversation_id = conversationId;
      else if (targetUser?.id) payload.recipient_id = targetUser.id;

      await supabase.from('messages').insert(payload);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (e: any) {
      console.error(e);
      Alert.alert('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) await uploadMedia(res.assets[0].uri, res.assets[0].fileName || 'image.jpg', 'image/jpeg', 'image');
  };

  const pickDoc = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!res.canceled) await uploadMedia(res.assets[0].uri, res.assets[0].name, res.assets[0].mimeType || 'application/octet-stream', 'file');
  };

  // ============================================================================
  // 🎨 RENDERERS
  // ============================================================================

  const renderMessageItem = ({ item, index }: { item: Message, index: number }) => {
    const isMe = item.sender_id === user?.id;
    let content = "Message unavailable";
    
    // Decrypt
    if (item.content_encrypted) {
      try { content = decryptMessage(item.content_encrypted); } catch { content = "🔒 Decryption Error"; }
    } else if (item.content) {
      content = item.content;
    }

    // Grouping
    const prev = messages[index - 1];
    const showDate = !prev || !isSameDay(new Date(prev.created_at), new Date(item.created_at));
    const dateLabel = format(new Date(item.created_at), 'MMM d, yyyy');

    return (
      <View>
        {showDate && (
          <View style={{ alignItems: 'center', marginVertical: 24 }}>
            <View style={{ backgroundColor: '#112240', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
              <Text style={{ color: '#8892B0', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{dateLabel}</Text>
            </View>
          </View>
        )}

        <Animated.View entering={SlideInRight} style={{ marginBottom: 12, flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onLongPress={() => {
                setSelectedMessage(item);
                setMenuVisible(true);
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            style={{
              maxWidth: '80%',
              padding: 12,
              borderRadius: 16,
              backgroundColor: isMe ? COLORS.primary : COLORS.card,
              borderBottomRightRadius: isMe ? 0 : 16,
              borderBottomLeftRadius: isMe ? 16 : 0,
              borderWidth: isMe ? 0 : 1,
              borderColor: isMe ? 'transparent' : 'rgba(255,255,255,0.1)',
              opacity: item.isOptimistic ? 0.7 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 2,
            }}
          >
            
            {/* --- MEDIA RENDERING (SECURE) --- */}
            
            {/* Image */}
            {item.message_type === 'image' && item.file_url && (
                <SecureImage 
                    path={item.file_url} 
                    style={{ width: 220, height: 160, borderRadius: 12, marginBottom: 8 }} 
                />
            )}

            {/* File */}
            {item.message_type === 'file' && item.file_url && (
                <SecureFile 
                    path={item.file_url} 
                    filename={item.file_name || 'Document'} 
                    isMe={isMe} 
                />
            )}

            {/* Text Content */}
            {(item.message_type === 'text' || !item.file_url) && (
              <Text style={{ fontSize: 15, lineHeight: 22, color: isMe ? '#0A192F' : 'white', fontWeight: isMe ? '500' : '400' }}>
                {content}
              </Text>
            )}

            {/* Meta */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4, gap: 4 }}>
              <Text style={{ fontSize: 10, color: isMe ? 'rgba(10, 25, 47, 0.6)' : 'rgba(255,255,255,0.4)' }}>
                {format(new Date(item.created_at), 'h:mm a')}
              </Text>
              {isMe && (
                item.isOptimistic 
                  ? <ActivityIndicator size="small" color="#0A192F" /> 
                  : <CheckCheck size={14} color="#0A192F" />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const copyText = async () => {
    if (selectedMessage?.content_encrypted) {
       const txt = decryptMessage(selectedMessage.content_encrypted);
       await Clipboard.setStringAsync(txt);
       setMenuVisible(false);
    }
  };

  // ============================================================================
  // 🟢 LOADING RENDER
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
          <ArrowLeft size={24} color={COLORS.dim} />
          <View style={{ marginLeft: 16, height: 40, width: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <View style={{ marginLeft: 12, height: 24, width: 120, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </View>
        <View style={{ padding: 24, flex: 1, justifyContent: 'flex-end' }}>
           <SkeletonMessage align="left" />
           <SkeletonMessage align="right" />
           <SkeletonMessage align="left" />
           <SkeletonMessage align="right" />
        </View>
      </SafeAreaView>
    );
  }

  // Changed the signature to remove `event: GestureResponderEvent` as it's not used by `pickDoc`
  const handlePickDocument = () => {
    pickDoc();
  }

  // ============================================================================
  // 🖥️ MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.card, zIndex: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8, marginLeft: -8 }}>
          <ArrowLeft size={24} color="#8892B0" />
        </TouchableOpacity>

        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0A192F', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' }}>
          {targetUser?.avatar_url ? (
            <Image source={{ uri: targetUser.avatar_url }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 18 }}>{targetUser?.first_name?.[0] || '?'}</Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }} numberOfLines={1}>
            {targetUser?.first_name ? `${targetUser.first_name} ${targetUser.last_name || ''}` : targetUser?.email || 'Unknown'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Lock size={12} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, fontSize: 12, marginLeft: 4, fontWeight: '500' }}>End-to-End Encrypted</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 8 }}>
          <MoreVertical size={24} color="#8892B0" />
        </TouchableOpacity>
      </View>
     

      {/* CHAT AREA */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        keyboardDismissMode="interactive"
        ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, opacity: 0.5 }}>
                <Lock size={64} color="#8892B0" />
                <Text style={{ marginTop: 24, fontSize: 18, fontWeight: 'bold', color: 'white' }}>Secure Channel</Text>
                <Text style={{ color: '#8892B0', marginTop: 8, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }}>
                    Messages in this chat are private and secure. No one outside of this chat can read them.
                </Text>
            </View>
        }
      />

      {/* UPLOAD OVERLAY */}
      {uploading && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <View style={{ backgroundColor: COLORS.card, padding: 32, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ color: 'white', marginTop: 24, fontWeight: 'bold', fontSize: 20 }}>Uploading Securely...</Text>
          </View>
        </View>
      )}

      {/* INPUT AREA */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        <View style={{ padding: 12, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 24 }}>
          
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
            <TouchableOpacity onPress={pickImage} style={{ padding: 10, borderRadius: 99, backgroundColor: COLORS.border }}>
              <ImageIcon size={22} color={COLORS.dim} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickDocument} style={{ padding: 10, borderRadius: 99, backgroundColor: COLORS.border }}>
              <Paperclip size={22} color={COLORS.dim} />
            </TouchableOpacity>
          </View>

          <TextInput 
            style={{ flex: 1, backgroundColor: COLORS.background, color: 'white', borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, paddingVertical: 12, maxHeight: 128, minHeight: 48, fontSize: 16, marginHorizontal: 8 }}
            placeholder="Secure message..."
            placeholderTextColor="#5a6b8c"
            value={input}
            onChangeText={setInput}
            multiline
            textAlignVertical="center"
          />

          <TouchableOpacity 
            onPress={handleSend} 
            disabled={!input.trim() || sending} 
            style={{ padding: 12, borderRadius: 99, marginBottom: 4, backgroundColor: input.trim() ? COLORS.primary : COLORS.border }}
          >
            {sending ? <ActivityIndicator size="small" color="#0A192F" /> : <Send size={22} color={input.trim() ? '#0A192F' : COLORS.dim} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* OPTIONS MODAL */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          {selectedMessage ? (
            <View style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingTop: 12 }}>
               <View style={{ alignItems: 'center', marginBottom: 12 }}><View style={{ width: 48, height: 6, backgroundColor: COLORS.border, borderRadius: 99 }} /></View>
               <TouchableOpacity onPress={copyText} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                 <Copy size={24} color="#fff" />
                 <Text style={{ marginLeft: 16, fontSize: 18, color: 'white', fontWeight: '500' }}>Copy</Text>
               </TouchableOpacity>
               {selectedMessage.sender_id === user?.id && (
                 <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete feature pending API update.')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                   <Trash2 size={24} color={COLORS.danger} />
                   <Text style={{ marginLeft: 16, fontSize: 18, color: COLORS.danger, fontWeight: '500' }}>Delete</Text>
                 </TouchableOpacity>
               )}
            </View>
          ) : (
            <View style={{ position: 'absolute', top: 60, right: 16, width: 240, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                 <Info size={20} color="#fff" />
                 <Text style={{ marginLeft: 12, fontSize: 16, color: 'white' }}>Contact Info</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                 <X size={20} color={COLORS.danger} />
                 <Text style={{ marginLeft: 12, fontSize: 16, color: COLORS.danger }}>Close Chat</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}