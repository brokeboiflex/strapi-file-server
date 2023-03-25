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

const { uploadFile, deleteFile, getFile, getAllFiles } =
  initFunctions(publicFolder);

app.use(cors(), fileUpload());

app.post("/upload", async (req, res) => {
  uploadFile(req, res);
});
app.delete("/files/*", async (req, res) => {
  deleteFile(req, res);
});
app.get("/listall", async (req, res) => {
  getAllFiles(req, res);
});
app.get("/files/*", async (req, res) => {
  getFile(req, res);
});

app.listen(port, () => {
  console.log(`File server ready on ${port}`);
});
