const fs = require("fs");
const path = require("path");

const { deriveKey, xor, hash } = require("./core/crypto");
const { createTarStream } = require("./core/streamTar");
const { injectNoise, removeNoise } = require("./core/stegoLayer");

const log = (m) => document.getElementById("log").textContent += m + "\n";

async function encrypt() {
  const files = document.getElementById("files").files;
  const password = document.getElementById("password").value;

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = deriveKey(password, salt);

  const outputPath = path.join(__dirname, "output", "_unknown_archive.rslhblk");
  const out = fs.createWriteStream(outputPath);

  let ivList = [];
  let hashList = [];

  createTarStream(files, (chunk) => {
    const iv = crypto.randomBytes(12);
    ivList.push(iv);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    let enc = Buffer.concat([cipher.update(chunk), cipher.final()]);
    const tag = cipher.getAuthTag();

    enc = Buffer.concat([enc, tag]);
    enc = xor(enc, 91);
    enc = injectNoise(enc);

    hashList.push(hash(enc));

    out.write(enc);
  });

  out.end(() => {
    fs.writeFileSync(
      path.join(__dirname, "meta", "key.enc.rslh.crx"),
      Buffer.concat([salt, Buffer.concat(ivList), Buffer.concat(hashList)])
    );

    fs.writeFileSync(
      path.join(__dirname, "meta", "info.rslh.crx"),
      Buffer.from(JSON.stringify({
        mode: "BLACKBOX_STREAM",
        xor: 91,
        version: 1
      }))
    );

    log("ENCRYPT COMPLETE");
  });
}

async function decrypt() {
  const password = document.getElementById("password").value;

  const data = fs.readFileSync("./output/_unknown_archive.rslhblk");
  const keyFile = fs.readFileSync("./meta/key.enc.rslh.crx");

  const salt = keyFile.slice(0, 16);
  const key = deriveKey(password, salt);

  let ivOffset = 16;
  let rebuilt = [];

  let offset = 0;

  while (offset < data.length) {
    let chunk = data.slice(offset, offset + 262144);
    offset += 262144;

    const iv = keyFile.slice(ivOffset, ivOffset + 12);
    ivOffset += 12;

    chunk = removeNoise(chunk);
    chunk = xor(chunk, 91);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(chunk.slice(chunk.length - 16));

    const dec = Buffer.concat([
      decipher.update(chunk.slice(0, -16)),
      decipher.final()
    ]);

    rebuilt.push(dec);
  }

  fs.writeFileSync("recovered.tar", Buffer.concat(rebuilt));

  log("DECRYPT COMPLETE");
}