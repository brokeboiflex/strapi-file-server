const fs = require("fs");
const crypto = require("crypto");

function getFileHash(filePath) {
  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
  return hash;
}

exports.getFileHash = getFileHash;
