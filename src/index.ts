require("dotenv").config({
  debug: true,
});
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import initFunctions from "./functions";
const app = express();
const port = 6661;

// Paths
const publicFolder = path.join(__dirname, "../public");
const protectedFolder = path.join(__dirname, "../public/protected");

const { upload, deleteFile, getFile, getAllFiles } = initFunctions(
  publicFolder,
  protectedFolder
);

app.use(cors(), fileUpload());

app.post("/upload", async (req, res) => {
  upload(req, res, publicFolder);
});
app.post("/protected-upload", async (req, res) => {
  upload(req, res, protectedFolder);
});
app.delete("/files/*", async (req, res) => {
  deleteFile(req, res);
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
  getFile(req, res);
});

app.listen(port, () => {
  console.log(`File server ready on ${port}`);
});
