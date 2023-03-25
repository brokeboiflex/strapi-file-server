const fs = require("fs");
const crypto = require("crypto");

function getFileHash(filePath) {
  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
  return hash;
}

function getStoredHashes(filePath) {
  let storedHashes = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    storedHashes = data.split("\n").filter(Boolean);
  }
  return storedHashes;
}

function updateStoredHashes(filePath, hashes) {
  const data = hashes.join("\n");
  fs.writeFileSync(filePath, data, "utf-8");
}

function removeStoredHash(filePath, hashToRemove) {
  const storedHashes = getStoredHashes(filePath);
  const filteredHashes = storedHashes.filter((hash) => hash !== hashToRemove);
  updateStoredHashes(filePath, filteredHashes);
}

function checkHash(filePath, storedHashesFilePath, passHash) {
  const hash = passHash ? passHash : getFileHash(filePath);
  const storedHashes = getStoredHashes(storedHashesFilePath);
  if (storedHashes.includes(hash)) {
    return true;
  } else {
    storedHashes.push(hash);
    updateStoredHashes(storedHashesFilePath, storedHashes);
    return false;
  }
}

exports.getFileHash = getFileHash;
exports.getStoredHashes = getStoredHashes;
exports.updateStoredHashes = updateStoredHashes;
exports.removeStoredHash = removeStoredHash;
exports.checkHash = checkHash;
