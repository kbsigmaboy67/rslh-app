const tar = require("tar-stream");
const fs = require("fs");

function createTarStream(files, onChunk) {
  const pack = tar.pack();

  pack.on("data", onChunk);

  for (let f of files) {
    const data = fs.readFileSync(f.path);
    pack.entry({ name: f.webkitRelativePath || f.name }, data);
  }

  pack.finalize();
}

module.exports = { createTarStream };
