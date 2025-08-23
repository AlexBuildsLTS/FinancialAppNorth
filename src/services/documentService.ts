import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export interface DocumentRecord {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  extracted_text?: string;
  processed_data?: any;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  file_size_mb: number;
  mime_type: string;
  created_at: string;
}

export const uploadDocument = async (
  userId: string,
  fileName: string,
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<DocumentRecord> => {
  const filePath = `${userId}/${Date.now()}-${fileName}`;
  const fileSize = (base64Data.length * 3) / 4 / (1024 * 1024); // Approximate size in MB

  // Check user's storage limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('storage_limit_mb')
    .eq('id', userId)
    .single();

  if (profile && fileSize > profile.storage_limit_mb) {
    throw new Error(`File size exceeds your ${profile.storage_limit_mb}MB limit`);
  }

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, decode(base64Data), {
      contentType: mimeType,
    });

  if (uploadError) throw uploadError;

  // Create database record
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_name: fileName,
      storage_path: filePath,
      status: 'uploaded',
      file_size_mb: fileSize,
      mime_type: mimeType,
    })
    .select()
    .single();

  if (error) throw error;

  // Trigger processing
  await supabase.functions.invoke('process-document', {
    body: { record: data },
  });

  return data;
};

export const fetchUserDocuments = async (): Promise<DocumentRecord[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteDocument = async (documentId: string, storagePath: string): Promise<void> => {
  // Delete from storage
  await supabase.storage
    .from('documents')
    .remove([storagePath]);

  // Delete from database
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
};

export const getDocumentUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath);
  
  return data.publicUrl;
};