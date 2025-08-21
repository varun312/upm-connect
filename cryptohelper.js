const crypto = require("crypto");
const fs = require("fs");

// AES-256-GCM parameters
const ALGO = "aes-256-gcm";
const KEY = fs.readFileSync("master-key.txt");
const IV_LENGTH = 12;

function encryptField(plaintext) {
  if (!plaintext) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Store iv + tag + ciphertext as base64
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptField(ciphertext) {
  if (!ciphertext) return null;
  const data = Buffer.from(ciphertext, "base64");

  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.slice(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encryptField, decryptField };
