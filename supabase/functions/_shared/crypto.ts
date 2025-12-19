import CryptoJS from 'crypto-js';

// Get the master key from server secrets
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

export function decryptMessage(cipherText: string): string | null {
  if (!cipherText) return null;
  
  // If no server key is set, we can't decrypt custom user keys.
  // We return null so the system falls back to the system-wide GEMINI_API_KEY.
  if (!ENCRYPTION_KEY) {
    console.error("CRITICAL: ENCRYPTION_KEY is missing in Supabase Secrets.");
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) return null;
    return originalText;
  } catch (error) {
    console.error("Decryption Failed:", error); 
    return null;
  }
}