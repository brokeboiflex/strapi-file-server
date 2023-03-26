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

// TODO cors
const allowedOrigins = [process.env.CLIENT, process.env.DB_SERVER];
const corsOptions = {
  // origin: function (origin, callback) {
  //   console.log("Request origin:", origin);
  //   if (allowedOrigins.indexOf(origin) !== -1) {
  //     // Allow access to the specified origin
  //     callback(null, true);
  //   } else {
  //     // Send a 403 Forbidden response
  //     callback(new Error("Forbidden"));
  //   }
  // },
};

const { uploadFile, deleteFile, getFile, getAllFiles } =
  initFunctions(publicFolder);

// app.disable("x-powered-by");
app.use(cors(corsOptions), fileUpload());

app.use(function (err, req, res, next) {
  if (err.message === "Forbidden") {
    res.status(403).send("Forbidden");
  } else {
    next(err);
  }
});

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
