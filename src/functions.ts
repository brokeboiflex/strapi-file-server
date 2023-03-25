import fs from "fs";
import path from "path";
import hashes from "./hashes";

import { query, mutation } from "./graphql";
import { getFileByHash, moveFile } from "./api";

const tempFolder = path.join(__dirname, "../temp");
const hashtablePath = path.join(__dirname, "../hashtable.txt");

export default function initFunctions(
  publicFolder: string,
  protectedFolder: string
) {
  const resolveFilePath = (req) =>
    path.join(publicFolder, decodeURI(req.url.substring(7, req.url.length)));

  const getFile = async (req, res) => {
    try {
      const pathToFile = resolveFilePath(req);
      res.status(200).sendFile(pathToFile);
    } catch (err) {
      throw new Error(err);
    }
  };

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

  // TODO try catch na etapy

  const upload = async (req, res, destination) => {
    try {
      if (!req.files) {
        return res.status(400).send("No files were uploaded.");
      } else {
        const fileName = await req.files.file.name;
        const tempPath = path.join(tempFolder, fileName);
        const constPath = path.join(destination, fileName);
        await req.files.file.mv(tempPath);
        const hash = hashes.getFileHash(tempPath);

        if (hashes.checkHash("", hashtablePath, hash)) {
          fs.unlinkSync(tempPath);
          const fileInfo = await query(getFileByHash(hash));
          const fileIsProtected = fileInfo.related.length;
          const currentPath = fileInfo.url;

          if (fileIsProtected) {
            // TODO jeśli plik jest bezpiecznie uploadowany

            //a nie jest bezpiecznie przechowany przenieś go do bezpiecznego folderu
            if (currentPath !== constPath) {
              const response = await mutation(moveFile(fileInfo.id, constPath));
              response && fs.renameSync(currentPath, constPath);
            }
            return res.status(200).send(constPath);
          } else return res.status(200).send(currentPath);
        } else {
          fs.renameSync(tempPath, constPath);
          return res.status(200).send(constPath);
        }
      }
    } catch (err) {
      console.log("Upload error");
      throw new Error(err);
    }
  };

  const deleteFile = async (req, res) => {
    try {
      const pathToFile = resolveFilePath(req);
      const canDeleteProtected = false; // TODO protected delete - może być wykonane jedynie z serwera gql jakoś po cors
      if (canDeleteProtected || pathToFile.includes("protected")) {
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
  };

  return { getFile, getAllFiles, upload, deleteFile };
}
