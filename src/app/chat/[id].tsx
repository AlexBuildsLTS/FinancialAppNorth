import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Send, Paperclip, Image as ImageIcon, Trash } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { getMessages, sendMessage } from '@/services/chatService';
import { Picker } from '@react-native-picker/picker';

// ADDED imports
import { getItem as secureGetItem, setItem as secureSetItem, deleteItem as secureDeleteItem } from '@/lib/secureStorage';
import { subscribe, supabase } from '@/lib/supabase'; // added supabase import

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = String(params.id ?? '');
  const { colors } = useTheme();
  const { session } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<string>('USD');
  const flatListRef = useRef<FlatList>(null);

  /* ------------------------
     E2EE helpers (client-side)
     - generate and persist ECDH P-256 keypair (JWK stored in SecureStore)
     - export public JWK (base64 JSON)
     - derive AES-GCM 256-bit key from peer public JWK
     - encrypt/decrypt with AES-GCM (iv included)
     NOTE: This is a client-side hook only. For group chats you'd need group key management.
  ------------------------ */

  const KEYPAIR_STORAGE_KEY = `e2ee-keypair-${/* user id if available */ (session?.user?.id ?? 'anon')}`;

  const bufToBase64 = (buf: ArrayBuffer) => {
    if (typeof Buffer !== 'undefined') return Buffer.from(buf).toString('base64');
    const bytes = new Uint8Array(buf);
    let str = '';
    for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
    return globalThis.btoa(str);
  };

  const base64ToBuf = (b64: string) => {
    if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').buffer;
    const bin = globalThis.atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  };

  async function ensureKeypair() {
    try {
      const stored = await secureGetItem(KEYPAIR_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      // generate ECDH P-256 keypair
      const kp = await (globalThis.crypto.subtle as any).generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey']
      );
      const pubJwk = await (globalThis.crypto.subtle as any).exportKey('jwk', kp.publicKey);
      const privJwk = await (globalThis.crypto.subtle as any).exportKey('jwk', kp.privateKey);
      const payload = { pubJwk, privJwk };
      await secureSetItem(KEYPAIR_STORAGE_KEY, JSON.stringify(payload));
      return payload;
    } catch (e) {
      console.warn('E2EE keypair ensure failed', e);
      return null;
    }
  }

  async function getPublicJwkBase64() {
    const kp = await ensureKeypair();
    if (!kp) return null;
    return globalThis.btoa(JSON.stringify(kp.pubJwk));
  }

  async function importPeerPublicKeyJwk(peerPubJwk: any) {
    // import peer public JWK
    try {
      const key = await (globalThis.crypto.subtle as any).importKey(
        'jwk',
        peerPubJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        []
      );
      return key;
    } catch (e) {
      console.warn('importPeerPublicKeyJwk failed', e);
      return null;
    }
  }

  async function deriveSharedAesKey(peerPubJwkOrBase64: any) {
    try {
      const kpRaw = await secureGetItem(KEYPAIR_STORAGE_KEY);
      if (!kpRaw) return null;
      const { privJwk } = JSON.parse(kpRaw);
      const myPriv = await (globalThis.crypto.subtle as any).importKey(
        'jwk',
        privJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveKey']
      );

      const peerJwk = typeof peerPubJwkOrBase64 === 'string' ? JSON.parse(globalThis.atob(peerPubJwkOrBase64)) : peerPubJwkOrBase64;
      const peerPub = await importPeerPublicKeyJwk(peerJwk);
      if (!peerPub) return null;

      const derived = await (globalThis.crypto.subtle as any).deriveKey(
        { name: 'ECDH', public: peerPub },
        myPriv,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      return derived;
    } catch (e) {
      console.warn('deriveSharedAesKey failed', e);
      return null;
    }
  }

  async function encryptWithSharedKey(sharedKey: CryptoKey, plaintext: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = (globalThis.crypto as any).getRandomValues(new Uint8Array(12));
    const ct = await (globalThis.crypto.subtle as any).encrypt({ name: 'AES-GCM', iv }, sharedKey, data);
    return { ciphertextBase64: bufToBase64(ct), ivBase64: bufToBase64(iv.buffer) };
  }

  async function decryptWithSharedKey(sharedKey: CryptoKey, ciphertextBase64: string, ivBase64: string) {
    try {
      const ctBuf = base64ToBuf(ciphertextBase64);
      const ivBuf = base64ToBuf(ivBase64);
      const plainBuf = await (globalThis.crypto.subtle as any).decrypt({ name: 'AES-GCM', iv: new Uint8Array(ivBuf) }, sharedKey, ctBuf);
      return new TextDecoder().decode(plainBuf);
    } catch (e) {
      console.warn('decrypt failed', e);
      return null;
    }
  }

  // Export symmetric AES key raw bytes
  async function exportSymRaw(symKey: CryptoKey) {
    const raw = await (globalThis.crypto.subtle as any).exportKey('raw', symKey);
    return raw as ArrayBuffer;
  }

  async function importSymKeyFromRaw(raw: ArrayBuffer) {
    return await (globalThis.crypto.subtle as any).importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }

  // Wrap a raw symmetric key for a recipient by deriving an ECDH key and AES-GCM encrypting the raw key
  async function wrapSymKeyWithDerivedKey(peerPubJwkOrBase64: any, symRaw: ArrayBuffer) {
    const derived = await deriveSharedAesKey(peerPubJwkOrBase64);
    if (!derived) throw new Error('Could not derive shared key for wrapping');
    const wrapIv = (globalThis.crypto as any).getRandomValues(new Uint8Array(12));
    const wrapped = await (globalThis.crypto.subtle as any).encrypt({ name: 'AES-GCM', iv: wrapIv }, derived, symRaw);
    return { wrappedKey: bufToBase64(wrapped), wrapIv: bufToBase64(wrapIv.buffer) };
  }

  /* ------------------------
     Helper: decrypt incoming message if metadata indicates e2ee
     Updated to handle per-recipient wrapped symmetric keys.
  ------------------------ */
  async function tryDecryptIncoming(msg: any) {
    try {
      if (!msg?.metadata?.e2ee) return msg;
      const meta = msg.metadata ?? {};
      const senderPubBase64 = meta.sender_public_jwk;
      if (!senderPubBase64) return msg;
      const myId = session?.user?.id;
      if (!myId) return msg;

      // recipients_wrapped: { [recipientId]: { wrappedKey, wrapIv } }
      const wrappedEntry = meta.recipients_wrapped?.[myId];
      if (!wrappedEntry) return msg; // not targeted to me

      // derive key from sender's public JWK and my private JWK
      const derived = await deriveSharedAesKey(senderPubBase64);
      if (!derived) return msg;

      // decrypt the wrapped symmetric raw
      const wrappedBuf = base64ToBuf(wrappedEntry.wrappedKey);
      const wrapIvBuf = new Uint8Array(base64ToBuf(wrappedEntry.wrapIv));
      const symRaw = await (globalThis.crypto.subtle as any).decrypt({ name: 'AES-GCM', iv: wrapIvBuf }, derived, wrappedBuf);

      // import symmetric key and decrypt content
      const symKey = await importSymKeyFromRaw(symRaw);
      const decrypted = await decryptWithSharedKey(symKey, msg.content, meta.iv);
      if (decrypted != null) {
        return { ...msg, decrypted_text: decrypted, content: decrypted };
      }
      return msg;
    } catch (e) {
      console.warn('tryDecryptIncoming failed', e);
      return msg;
    }
  }

  /* ------------------------
     Real-time subscription
     - subscribe to messages and append INSERTs for this conversation
  ------------------------ */
  useEffect(() => {
    if (!conversationId) return;
    const unsub = subscribe('messages', async (payload: any) => {
      const { eventType, new: n } = payload;
      if (eventType !== 'INSERT' || !n) return;
      // channel_id can be number or string
      if (String(n.channel_id) !== String(conversationId)) return;
      try {
        const decrypted = await tryDecryptIncoming(n);
        setMessages(prev => [...prev, decrypted]);
        setTimeout(() => flatListRef.current?.scrollToEnd?.(), 200);
      } catch (e) {
        console.error('realtime incoming message handling error', e);
      }
    });
    return () => unsub();
  }, [conversationId]);

  /* ------------------------
     Load messages (decrypt any E2EE messages)
  ------------------------ */
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data: any = await getMessages(conversationId);
      const rows = Array.isArray(data) ? data : (data?.messages ?? []);
      // decrypt any messages that have e2ee metadata
      const decryptedRows = await Promise.all(rows.map((r: any) => tryDecryptIncoming(r)));
      setMessages(decryptedRows);
      setTimeout(() => flatListRef.current?.scrollToEnd?.(), 200);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    // TODO: add realtime subscription for live updates
  }, [loadMessages]);

  const pickDocument = async () => {
    try {
      const res = (await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false })) as any;
      if (res?.type === 'success') {
        setAttachments(prev => [...prev, { uri: res.uri, name: res.name, size: res.size, mimeType: res.mimeType || 'application/octet-stream' }]);
      }
    } catch (err) {
      console.error('Document pick error', err);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow access to your photos to attach images.');
        return;
      }
      const result = (await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })) as any;
      if (!result.canceled) {
        const asset = Array.isArray(result.assets) ? result.assets[0] : result;
        setAttachments(prev => [...prev, { uri: asset.uri, name: asset.fileName ?? `image-${Date.now()}.jpg`, size: asset.fileSize ?? 0, mimeType: asset.type ? `image/${asset.type}` : 'image/jpeg' }]);
      }
    } catch (err) {
      console.error('Image pick error', err);
    }
  };

  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

  /* ------------------------
     Sending: encrypt text if E2EE enabled
     - ensure keys, derive shared key using recipient's public key (for direct message)
     - attach metadata: e2ee=true, sender_public_jwk (base64), iv
     NOTE: for group chat this is simplified — you likely need per-recipient encryption or group keys.
  ------------------------ */
  const onSend = async () => {
    if (!session?.user) {
      Alert.alert('Not signed in', 'You must be signed in to send messages.');
      return;
    }
    if (!text.trim() && attachments.length === 0) return;
    setLoading(true);
    try {
      const metadata: any = { currency };

      // attempt to perform E2EE only if all recipients have public_jwk
      // 1) get participants for this channel
      const { data: parts, error: partsErr } = await supabase
        .from('channel_participants')
        .select('user_id')
        .eq('channel_id', conversationId);
      if (partsErr) {
        console.warn('Could not fetch participants for E2EE, sending plaintext', partsErr);
      }
      const participants = (parts ?? []).map((p: any) => p.user_id).filter((id: string) => id !== session.user.id);

      // If no other participants (e.g., a channel with only you), fallback to plaintext
      let e2eeEnabled = participants.length > 0;

      // fetch recipient public_jwk
      let recipientProfiles: any[] = []; 
      if (e2eeEnabled) {
        const { data: profs, error: profErr } = await supabase
          .from('profiles')
          .select('id, public_jwk')
          .in('id', participants);
        if (profErr) {
          console.warn('Could not fetch recipient public_jwk; disabling E2EE for this message', profErr);
          e2eeEnabled = false;
        } else {
          recipientProfiles = profs ?? [];
          const missing = participants.filter((id: string) => !recipientProfiles.find(r => r.id === id || r.public_jwk));
          if (missing.length > 0) {
            console.warn('Some recipients lack public_jwk, disabling E2EE for this message', missing);
            e2eeEnabled = false;
          }
        }
      }

      // attach sender public key so recipients can derive shared secret
      const myPubBase64 = await getPublicJwkBase64(); 
      if (myPubBase64) metadata.sender_public_jwk = myPubBase64;

      let contentToSend = text.trim();

      if (e2eeEnabled && contentToSend) {
        // 2) generate symmetric key and export raw
        const symKey = await (globalThis.crypto.subtle as any).generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const symRaw = await exportSymRaw(symKey);

        // 3) encrypt the message content with the symmetric key
        const msgIv = (globalThis.crypto as any).getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const pt = encoder.encode(contentToSend);
        const ctBuf = await (globalThis.crypto.subtle as any).encrypt({ name: 'AES-GCM', iv: msgIv }, symKey, pt);
        contentToSend = bufToBase64(ctBuf);
        metadata.iv = bufToBase64(msgIv.buffer);

        // 4) for each recipient, derive shared key and wrap symmetric raw
        const recipients_wrapped: Record<string, { wrappedKey: string; wrapIv: string }> = {};
        for (const rp of recipientProfiles) {
          const peerPub = rp.public_jwk;
          try {
            const wrap = await wrapSymKeyWithDerivedKey(peerPub, symRaw);
            recipients_wrapped[rp.id] = wrap;
          } catch (e) {
            console.warn('Failed to wrap sym key for recipient', rp.id, e);
            // if any wrap fails, disable E2EE (avoid partially encrypted recipients)
            e2eeEnabled = false;
            break;
          }
        }

        if (e2eeEnabled) {
          metadata.e2ee = true;
          metadata.recipients_wrapped = recipients_wrapped;
        } else {
          // fallback: don't include wrapping metadata; send plaintext
          contentToSend = text.trim();
          delete metadata.iv;
          delete metadata.recipients_wrapped;
          delete metadata.e2ee;
        }
      }

      await sendMessage({
        conversationId,
        senderId: session.user.id,
        text: contentToSend,
        attachments,
        metadata,
      });

      setText('');
      setAttachments([]);
      await loadMessages();
      setTimeout(() => flatListRef.current?.scrollToEnd?.(), 200);
    } catch (err) {
      console.error('Send failed', err);
      Alert.alert('Send failed', 'Could not send message. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderAttachmentPreview = ({ item, index }: { item: any, index: number }) => (
    <View style={[styles.attachmentPreview, { backgroundColor: colors.surface }]}>
      {item.mimeType?.startsWith?.('image') ? (
        <Image source={{ uri: item.uri }} style={styles.attachmentImage} />
      ) : (
        <View style={styles.attachmentFileIcon}><ImageIcon size={18} color={colors.textSecondary} /></View>
      )}
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={{ color: colors.text, fontSize: 13 }} numberOfLines={1}>{item.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.size ? `${Math.round(item.size/1024)} KB` : ''}</Text>
      </View>
      <TouchableOpacity onPress={() => removeAttachment(index)}><Trash size={18} color={colors.error} /></TouchableOpacity>
    </View>
  );

  const renderMessage = ({ item }: { item: any }) => {
    const mine = item.sender_id === session?.user?.id;
    return (
      <View style={[styles.messageRow, { alignSelf: mine ? 'flex-end' : 'flex-start', backgroundColor: mine ? colors.primary : colors.surface }]}>
        {item.text ? <Text style={{ color: mine ? colors.primaryContrast : colors.text }}>{item.text}</Text> : null}
        {Array.isArray(item.attachments) && item.attachments.map((att: any, i: number) => (
          <TouchableOpacity key={i} onPress={() => att.url && router.push(att.url)}>
            {att.mimeType?.startsWith?.('image') ? <Image source={{ uri: att.url }} style={styles.messageImage} /> : <View style={styles.messageFile}><Text style={{ color: colors.text }}>{att.name || 'Attachment'}</Text></View>}
          </TouchableOpacity>
        ))}
        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6, alignSelf: 'flex-end' }}>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(m) => String(m.id ?? Math.random())}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No messages yet. Start the conversation!</Text>}
        />

        {attachments.length > 0 && (
          <FlatList
            data={attachments}
            renderItem={renderAttachmentPreview}
            horizontal
            keyExtractor={(_, i) => String(i)}
            style={{ paddingHorizontal: 12, marginBottom: 8 }}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          />
        )}

        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}><ImageIcon size={20} color={colors.textSecondary} /></TouchableOpacity>
            <TouchableOpacity onPress={pickDocument} style={styles.iconButton}><Paperclip size={20} color={colors.textSecondary} /></TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
          />

          <View style={{ width: 110, marginLeft: 8 }}>
            <Picker selectedValue={currency} onValueChange={(val) => setCurrency(val)} style={{ color: colors.text, height: Platform.OS === 'ios' ? 44 : 48 }}>
              <Picker.Item label="USD" value="USD" />
              <Picker.Item label="EUR" value="EUR" />
              <Picker.Item label="SEK" value="SEK" />
              <Picker.Item label="GBP" value="GBP" />
            </Picker>
          </View>

          <TouchableOpacity onPress={onSend} style={[styles.sendButton, { backgroundColor: colors.primary }]} disabled={loading}>
            <Send size={18} color={colors.primaryContrast ?? '#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  attachmentPreview: { minWidth: 160, padding: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  attachmentImage: { width: 56, height: 56, borderRadius: 8 },
  attachmentFileIcon: { width: 56, height: 56, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  messageRow: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '80%' },
  messageImage: { width: 200, height: 120, borderRadius: 8, marginTop: 8 },
  messageFile: { padding: 8, borderRadius: 8, backgroundColor: '#222', marginTop: 8 },
  iconButton: { padding: 8, borderRadius: 8 },
});