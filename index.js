// import * as dotenv from "dotenv";
// dotenv.config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// TODO
// brotli /gzip
// sprawdzanie plików po checksumach by nie zaśmiecać dysku

const app = express();
const port = 6661; // 777 jest liczba boga  nodejs nie zasługuje
const public = path.join(__dirname, "public");

const resolveFilePath = (req) =>
  path.join(public, decodeURI(req.url.substring(7, req.url.length)));
app.use(cors(), fileUpload());

app.post("/upload", async (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  } else {
    const fileName = req.files.file.name;
    console.log(fileName);
    const newName = uuidv4() + "." + fileName.split(".").pop();
    // console.log(req.files.file.name.split(".").pop());
    await req.files.file.mv(__dirname + "/public/" + fileName);
    return res.status(200).send(newName);
  }
});
app.delete("/files/*", async (req, res) => {
  const pathToFile = resolveFilePath(req);
  fs.unlinkSync(pathToFile);
  return res.status(200).send("ok");
});

app.get("/listall", async (req, res) => {
  // const allFiles =
  // res.send(allFiles);
});

app.get("/files/*", async (req, res) => {
  const pathToFile = resolveFilePath(req);
  console.log(pathToFile);
  res.sendFile(pathToFile);
});

app.listen(port, () => {
  console.log(`File server ready on ${port}`);
});
