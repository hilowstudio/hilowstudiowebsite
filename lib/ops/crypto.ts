import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptionError";
  }
}

export class DecryptionError extends Error {
  readonly code = "decryption_failed";
  constructor(message = "Stored value could not be decrypted") {
    super(message);
    this.name = "DecryptionError";
  }
}

function getEncryptionKey(): Buffer {
  const secret = process.env.OPS_ENCRYPTION_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new EncryptionError(
        "OPS_ENCRYPTION_KEY must be set in production",
      );
    }
    return crypto.scryptSync(
      "hilow_ops_development_secret_dummy_key_please_change",
      "salt",
      32,
    );
  }
  return crypto.scryptSync(secret, "salt", 32);
}

export function encryptString(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch {
    throw new EncryptionError("Encryption failed");
  }
}

export function decryptString(text: string): string {
  if (!text) return text;
  if (!text.includes(":")) return text;

  const parts = text.split(":");
  if (parts.length !== 3) {
    throw new DecryptionError("Malformed ciphertext");
  }

  try {
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const encryptedText = Buffer.from(parts[2], "hex");

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    throw new DecryptionError();
  }
}

export function tryDecryptString(text: string): string {
  try {
    return decryptString(text);
  } catch (err) {
    if (err instanceof DecryptionError) return "";
    throw err;
  }
}
