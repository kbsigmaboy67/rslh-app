const crypto = require("crypto");

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 400000, 32, "sha256");
}

function xor(data, key = 91) {
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key;
  return out;
}

function hash(data) {
  return crypto.createHash("sha256").update(data).digest();
}

module.exports = { deriveKey, xor, hash };