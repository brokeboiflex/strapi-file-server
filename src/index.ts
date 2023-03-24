const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const hashes = require("./hashes");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  debug: true,
});
const app = express();
const port = 6661;

// Paths
const publicFolder = path.join(__dirname, "../public");
const protectedFolder = path.join(__dirname, "../public/protected");
const tempFolder = path.join(__dirname, "../temp");

const hashtablePath = path.join(__dirname, "../hashtable.txt");

const resolveFilePath = (req) =>
  path.join(publicFolder, decodeURI(req.url.substring(7, req.url.length)));
app.use(cors(), fileUpload());

const getAllFiles = (dirPath: string, arrayOfFiles?: string[]) => {
  const files = fs.readdirSync(dirPath);
  let fileArray = arrayOfFiles ? arrayOfFiles : [];
  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      fileArray = getAllFiles(dirPath + "/" + file, fileArray);
    } else {
      console.log(dirPath);
      fileArray.push(
        path.join(__dirname, dirPath, "/", file).split("public/")[1]
      );
    }
  });

  return arrayOfFiles;
};

console.log(process.env.DB_SERVER);
// fetch(process.env.SERVER, {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
//   body: JSON.stringify({ query: "{ hello }" }),
// })
//   .then((r) => r.json())
//   .then((data) => console.log("data returned:", data));

// TODO jeśli plik już jest na serwerze zwróć jego ścieżkę
// jeśli plik jest bezpiecznie uploadowany a nie jest bezpiecznie przechowany przenieś go do bezpiecznego folderu
// protected delete - może być wykonane jedynie z serwera gql jakoś po cors

const upload = async (req, res, destination) => {
  // TODO jeżeli plik istnieje ale nie jest chroniony zabezpiecz go

  console.log(process.env.SERVER_URL);
  try {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    } else {
      const fileName = await req.files.file.name;
      const tempPath = path.join(tempFolder, fileName);
      const constPath = path.join(destination, fileName);

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
};

app.post("/upload", async (req, res) => {
  upload(req, res, publicFolder);
});
app.post("/protected-upload", async (req, res) => {
  upload(req, res, protectedFolder);
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
    const allFiles = getAllFiles(publicFolder);
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
