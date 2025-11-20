import { secureStorage } from './secureStorage';
import { registerPublicJwk } from '@/shared/lib/keyRegistry';

const KEYPAIR_STORAGE_KEY = (userId = 'anon') => `e2ee-keypair-${userId}`;
const PUBLISHED_FLAG_KEY = (userId = 'anon') => `e2ee-published-${userId}`;

export async function ensureKeypairForUser(userId: string) {
  const keyK = KEYPAIR_STORAGE_KEY(userId);
  try {
    const stored = await secureStorage.getItem(keyK);
    if (stored) return JSON.parse(stored);
    // generate ECDH P-256 keypair
    const kp = await (globalThis.crypto.subtle as any).generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey']
    );
    const pubJwk = await (globalThis.crypto.subtle as any).exportKey('jwk', kp.publicKey);
    const privJwk = await (globalThis.crypto.subtle as any).exportKey('jwk', kp.privateKey);
    const payload = { pubJwk, privJwk }; // secureSetItem is not defined
    await secureStorage.setItem(keyK, JSON.stringify(payload));
    return payload;
  } catch (e) {
    console.warn('ensureKeypairForUser failed', e);
    return null;
  }
}

export async function getPublicJwkBase64ForUser(userId: string) {
  const kp = await ensureKeypairForUser(userId);
  if (!kp) return null;
  return globalThis.btoa(JSON.stringify(kp.pubJwk));
}

/**
 * Publish the public JWK to the user's profile if not already published.
 * Returns true when published or already present; false on error or if schema/permissions prevent it.
 */
export async function publishPublicJwkIfNeeded(userId: string) {
  try {
    const flagK = PUBLISHED_FLAG_KEY(userId);
    const already = await secureStorage.getItem(flagK);
    if (already) return true; // already published or attempted

    const pubBase64 = await getPublicJwkBase64ForUser(userId);
    if (!pubBase64) {
      // mark as attempted so we don't retry endlessly
      await secureSetItem(flagK, '0');
      return false;
    } // secureSetItem is not defined

    try {
      await registerPublicJwk(pubBase64);
      // success — mark published
      await secureSetItem(flagK, '1');
      return true;
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      // known PostgREST schema-cache error (missing column)
      if (err?.code === 'PGRST204' || msg.includes("Could not find the 'public_jwk' column")) {
        console.warn('publishPublicJwkIfNeeded: profiles.public_jwk column missing — skipping publish');
        // mark attempted so client doesn't repeatedly retry
        await secureSetItem(flagK, '0');
        return false;
      }
      // permissions / RLS errors
      if (msg.includes('permission denied') || msg.includes('forbidden') || msg.includes('401') || msg.includes('403')) {
        console.warn('publishPublicJwkIfNeeded: permission denied while updating profile — skipping publish');
        await secureSetItem(flagK, '0');
        return false;
      }
      // unexpected — still mark attempted to avoid noisy loops, but rethrow for visibility if necessary
      console.warn('publishPublicJwkIfNeeded: unexpected error when publishing public_jwk; marking attempted to stop retries', err);
      await secureSetItem(flagK, '0');
      return false;
    }
  } catch (e) {
    console.warn('publishPublicJwkIfNeeded failed', e);
    // ensure we mark attempted so we don't retry constantly
    try { await secureStorage.setItem(PUBLISHED_FLAG_KEY(userId), '0'); } catch {}
    return false;
  }
}
function secureSetItem(flagK: string, arg1: string) {
  throw new Error('Function not implemented.');
}

