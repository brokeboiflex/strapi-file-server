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
app.use(cors(), fileUpload());

app.post("/upload", async (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  } else {
    const newName = uuidv4() + "." + req.files.file.name.split(".").pop();
    console.log(req.files.file.name.split(".").pop());
    await req.files.file.mv(__dirname + "/public/" + newName);
    return res.status(200).send(newName);
  }
});
// app.delete("/files/:filename");

app.get("/files/*", async (req, res) => {
  console.log(req.url);
  const pathToFile = req.url.substring(7, req.url.length);
  console.log(pathToFile);
  res.sendFile(path.join(public, pathToFile));
  // const allFiles = res.send(allFiles);
});

app.listen(port, () => {
  console.log(`File server ready on ${port}`);
});
