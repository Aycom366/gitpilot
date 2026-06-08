import * as crypto from 'crypto';
import { config } from 'src/config';

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns { encrypted, iv, authTag } — all hex-encoded.
 */
export function encrypt(plaintext: string): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const key = Buffer.from(config.encryptionKey!, 'hex');
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
}

/**
 * Decrypts an AES-256-GCM encrypted value.
 */
export function decrypt(
  encrypted: string,
  iv: string,
  authTag: string,
): string {
  const key = Buffer.from(config.encryptionKey!, 'hex');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  return (
    decipher.update(Buffer.from(encrypted, 'hex')).toString('utf8') +
    decipher.final('utf8')
  );
}
