import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Profile } from '@/types';

export interface ScannedDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string; // Path in Supabase storage
  mime_type: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extracted_text?: string;
  created_at: string;
}

/**
 * Uploads a document (from a base64 string) to Supabase Storage and creates a record in the database.
 * @param fileBase64 - The base64 encoded string of the file.
 * @param fileName - The desired name for the file.
 * @param userId - The ID of the user uploading the file.
 */
export const uploadDocument = async (fileBase64: string, fileName: string, userId: string): Promise<ScannedDocument> => {
  const filePath = `${userId}/${fileName}_${Date.now()}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, decode(fileBase64), {
      contentType: 'image/jpeg', // Assuming JPEG, can be made dynamic
    });

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }

  // Get file metadata to store in the database
  const { data: fileData } = await supabase.storage.from('documents').getPublicUrl(filePath);
    if(!fileData || !fileData.publicUrl){
         console.error('Error getting file public URL: No public URL returned');
        throw new Error('Could not get public URL for the uploaded file.');
    }


  // Create a record in the 'documents' table
  const { data: dbRecord, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      mime_type: 'image/jpeg',
      file_size: fileData?.publicUrl.length, // This is an approximation
      status: 'pending', // OCR processing will be triggered by this status
    })
    .select()
    .single();

  if (dbError) {
    console.error('Error creating document record:', dbError);
    throw dbError;
  }

  return dbRecord as ScannedDocument;
};

/**
 * Fetches all document records for a specific user.
 * @param userId - The ID of the user.
 */
export const getUserDocuments = async (userId: string): Promise<ScannedDocument[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
  return data;
};

/**
 * Deletes a document from Supabase Storage and its corresponding record from the database.
 * @param document - The document object to be deleted.
 */
export const deleteDocument = async (document: ScannedDocument): Promise<void> => {
  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([document.file_path]);

  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
    throw storageError;
  }

  // Then delete the database record
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', document.id);

  if (dbError) {
    console.error('Error deleting document record:', dbError);
    throw dbError;
  }
};