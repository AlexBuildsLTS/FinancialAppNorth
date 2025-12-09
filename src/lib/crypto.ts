import CryptoJS from 'crypto-js';

// 1. Get the Key
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.error("CRITICAL: EXPO_PUBLIC_ENCRYPTION_KEY is missing. Messages will not be secure.");
}

/**
 * Encrypts a message string using AES.
 */
export const encryptMessage = (text: string): string => {
  if (!text) return '';
  if (!ENCRYPTION_KEY) return text; // Fallback (unsafe, but prevents crash)

  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption Failed:", error);
    return text; // Return original on failure to avoid data loss
  }
};

/**
 * Decrypts a message string using AES.
 */
export const decryptMessage = (cipherText: string): string => {
  if (!cipherText) return '';
  if (!ENCRYPTION_KEY) return cipherText;

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryption produces empty string (wrong key), return error text or cipher
    return originalText || '[Encrypted Message]';
  } catch (error) {
    // console.warn("Decryption Failed:", error); 
    return '[Decryption Error]';
  }
};