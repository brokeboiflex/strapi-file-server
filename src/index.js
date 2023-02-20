// import * as dotenv from "dotenv";
// dotenv.config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const hashes = require("./hashes");

const app = express();
const port = 6661;
const public = path.join(__dirname, "../public");
const hashtablePath = path.join(__dirname, "../hashtable.txt");
console.log(hashtablePath);

const resolveFilePath = (req) =>
  path.join(public, decodeURI(req.url.substring(7, req.url.length)));
app.use(cors(), fileUpload());

const getAllFiles = (dirPath, arrayOfFiles) => {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      console.log(dirPath);
      arrayOfFiles.push(
        path.join(__dirname, dirPath, "/", file).split("public/")[1]
      );
    }
  });

  return arrayOfFiles;
};

// TODO jeśli plik już jest na serwerze zwróć jego ścieżkę
// jeśli plik jest bezpiecznie uploadowany a nie jest bezpiecznie przechowany przenieś go do bezpiecznego folderu
// protected delete - może być wykonane jedynie z serwera gql jakoś po cors
app.post("/upload", async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    } else {
      const fileName = await req.files.file.name;
      const tempPath = path.join(__dirname, "../temp", fileName);
      const constPath = path.join(__dirname, "../public", fileName);
      await req.files.file.mv(tempPath);
      if (hashes.checkHash(tempPath, hashtablePath)) {
        fs.unlinkSync(tempPath);
        return res.status(400).send("File already exists");
      } else {
        fs.renameSync(tempPath, constPath);
        return res.status(200).send(fileName);
      }
    }
  } catch (err) {
    console.log("Upload error");
    throw new Error(err);
  }
});
app.post("/protected-upload", async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    } else {
      const fileName = await req.files.file.name;
      const tempPath = path.join(__dirname, "../temp", fileName);
      const constPath = path.join(__dirname, "../public/protected", fileName);
      await req.files.file.mv(tempPath);
      if (hashes.checkHash(tempPath, hashtablePath)) {
        fs.unlinkSync(tempPath);
        return res.status(400).send("File already exists");
      } else {
        fs.renameSync(tempPath, constPath);
        return res.status(200).send(fileName);
      }
    }
  } catch (err) {
    console.log("Upload error");
    throw new Error(err);
  }
});
app.delete("/files/*", async (req, res) => {
  try {
    const pathToFile = resolveFilePath(req);
    if (pathToFile.includes("protected")) {
      return res.status(400).send("Cannot remove protected file");
    } else {
      const fileHash = hashes.getFileHash(pathToFile);
      fs.unlinkSync(pathToFile);
      hashes.removeStoredHash(hashtablePath, fileHash);
      return res.status(200).send("ok");
    }
  } catch (err) {
    throw new Error(err);
  }
});
app.get("/listall", async (req, res) => {
  try {
    const allFiles = getAllFiles(public);
    return res.status(200).send(allFiles);
  } catch (err) {
    throw new Error(err);
  }
});
app.get("/files/*", async (req, res) => {
  try {
    const pathToFile = resolveFilePath(req);
    res.status(200).sendFile(pathToFile);
  } catch (err) {
    throw new Error(err);
  }
});

app.listen(port, () => {
  console.log(`File server ready on ${port}`);
});
