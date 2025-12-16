/**
 * 1. Get the Key
 */
import CryptoJS from 'crypto-js';
const ENCRYPTION_KEY: string | undefined = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;

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
/**
 * Generates a random encryption key
 */
export const generateKey = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

/**
 * Hashes a string using SHA256
 */
export const hashString = (text: string): string => {
  return CryptoJS.SHA256(text).toString();
};

/**
 * ============================================================================
 * 🔐 E2EE FUNCTIONS (Titan 1 - Zero-Knowledge Architecture)
 * ============================================================================
 * Simple aliases for encryptMessage/decryptMessage to match E2EE naming convention.
 * Used by messaging system for client-side encryption before storage.
 * ============================================================================
 */

/**
 * Encrypts text for E2EE messaging (alias for encryptMessage)
 */
export const encrypt = (text: string): string => {
  return encryptMessage(text);
};

/**
 * Decrypts E2EE encrypted text (alias for decryptMessage)
 */
export const decrypt = (cipherText: string): string => {
  return decryptMessage(cipherText);
};