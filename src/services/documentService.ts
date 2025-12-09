import { supabase } from '../lib/supabase';
import { DocumentItem, TablesInsert, Transaction } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

export class DocumentService {
  /**
   * Get all documents for a user
   */
  static async getDocuments(userId: string): Promise<DocumentItem[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((d: any) => ({
      ...d,
      name: d.file_name,
      type: d.type || 'other',
      url: d.url || supabase.storage.from('documents').getPublicUrl(d.file_path).data.publicUrl,
      date: d.created_at,
      size: d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : 'Unknown'
    }));
  }

  /**
   * Upload a document
   */
  static async uploadDocument(
    userId: string,
    uri: string,
    fileName: string,
    type: 'receipt' | 'invoice' | 'contract' | 'other' = 'other'
  ) {
    try {
      const filePath = `${userId}/${Date.now()}_${fileName}`;
      let fileBody: any;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileBody = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        fileBody = decode(base64);
      }

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBody, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Get file size
      let sizeBytes = 0;
      if (Platform.OS !== 'web') {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && !fileInfo.isDirectory) {
          sizeBytes = fileInfo.size || 0;
        }
      }

      const insertData: TablesInsert<'documents'> & { type: 'receipt' | 'invoice' | 'contract' | 'other' } = {
        user_id: userId,
        file_name: fileName,
        file_path: filePath,
        mime_type: 'image/jpeg',
        size_bytes: sizeBytes,
        status: 'processed',
        extracted_data: {},
        type: type
      };

      const { data, error: dbError } = await supabase
        .from('documents')
        .insert(insertData)
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        ...data,
        url: publicUrl,
        name: fileName,
        date: data.created_at,
        size: sizeBytes ? `${(sizeBytes / 1024).toFixed(1)} KB` : 'Unknown'
      };
    } catch (e: any) {
      console.error('Upload failed:', e.message);
      throw e;
    }
  }

  /**
   * Pick and upload file from device
   */
  static async pickAndUploadFile(userId: string) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled) return null;

      const asset = result.assets[0];
      return await this.uploadDocument(userId, asset.uri, asset.name, 'other');
    } catch (e: any) {
      console.error("File Picker Error:", e.message);
      throw e;
    }
  }

  /**
   * Process document with OCR
   */
  static async processReceiptAI(documentPath: string) {
    const { data, error } = await supabase.functions.invoke('ocr-scan', {
      body: { documentPath }
    });

    if (error) throw new Error(error.message || 'AI processing failed');
    if (data?.error) throw new Error(data.error);

    return data.data;
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string) {
    // First get the document to get file path
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    if (doc.file_path) {
      await supabase.storage.from('documents').remove([doc.file_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
  static async exportToCSV(userId: string) {
    const docs = await this.getDocuments(userId);
    const { TransactionService } = await import('./transactionService.js');
    const txs = await TransactionService.getTransactions(userId);

    if (docs.length === 0 && txs.length === 0) {
      throw new Error("No data to export.");
    }

    let csvContent = "Type,Date,Description,Amount,Category,File Name\n";

    txs.forEach((t: TransactionItem) => {

    txs.forEach(t => {
      const amount = t.amount ? t.amount.toFixed(2) : "0.00";
      csvContent += `Transaction,${t.date},"${t.description || ''}",${amount},${t.category || ''},-\n`;
    });

    docs.forEach(d => {
      csvContent += `Document,${d.date},"${d.name || 'Doc'}",-,-,"${d.file_name || ''}"\n`;
    });

    const fileUri = FileSystem.documentDirectory + `NorthFinance_Report_${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error("Sharing is not available on this device");
    }
  }

  /**
   * Update document metadata
   */
  static async updateDocument(id: string, updates: Partial<DocumentItem>) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        extracted_data: updates.extracted_data,
        status: updates.status,
        type: updates.type
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}