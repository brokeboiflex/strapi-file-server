// import * as dotenv from "dotenv";
// dotenv.config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
// const path = require("path");

// brotli /gzip

const app = express();
const port = 6661; // 777 jest liczba boga do którego prowadzi elixir, nodejs nie zasługuje

app.use(cors(), fileUpload());

app.post("/upload", (req, res) => {
  // console.log(req);
  console.log(req.files);
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files;

  const path = __dirname + "/public/" + file.name;

  console.log(file);
});

app.listen(port, () => {
  console.log(`File server ready on ${port}`);
});
