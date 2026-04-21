function injectNoise(buffer, step = 17) {
  const out = [];
  for (let i = 0; i < buffer.length; i++) {
    out.push(buffer[i]);
    if (i % step === 0) out.push(Math.floor(Math.random() * 256));
  }
  return Buffer.from(out);
}

function removeNoise(buffer, step = 17) {
  const out = [];
  for (let i = 0; i < buffer.length; i++) {
    if (i % (step + 1) !== 1) out.push(buffer[i]);
  }
  return Buffer.from(out);
}

module.exports = { injectNoise, removeNoise };