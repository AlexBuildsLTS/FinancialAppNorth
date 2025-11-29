import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

// STRICT: No fallback. If the key is missing, we want to know.
const SECRET_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.error("⚠️ CRITICAL SECURITY WARNING: EXPO_PUBLIC_ENCRYPTION_KEY is missing from .env file. Encryption will not work.");
}

export const encryptMessage = (text: string): string => {
  if (!SECRET_KEY) {
    // Fail secure: Don't send unencrypted text if we expect encryption
    throw new Error("Encryption Key Missing"); 
  }
  try {
    return AES.encrypt(text, SECRET_KEY).toString();
  } catch (e) {
    console.error("Encryption failed", e);
    throw e;
  }
};

export const decryptMessage = (cipherText: string): string => {
  if (!SECRET_KEY) return cipherText; // Cannot decrypt without key
  try {
    const bytes = AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(Utf8);
    // If decryption produces empty string (wrong key), return cipherText (fail safe)
    return decrypted || cipherText; 
  } catch (e) {
    return cipherText;
  }
};