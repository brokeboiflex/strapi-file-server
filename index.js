// import * as dotenv from "dotenv";
// dotenv.config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
// const path = require("path");

// TODO
// brotli /gzip
// sprawdzanie plików po checksumach by nie zaśmiecać dysku

const app = express();
const port = 6661; // 777 jest liczba boga do którego prowadzi elixir, nodejs nie zasługuje

app.use(cors(), fileUpload());
app.use(express.static("public"));

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

app.listen(port, () => {
  console.log(`File server ready on ${port}`);
});
