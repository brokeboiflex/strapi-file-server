import fs from "fs";
import path from "path";
import { createClient } from "@urql/core";
import checkDiskSpace from "check-disk-space";

import extensions from "./file-extensions";
import hashes from "./hashes";
import { createFile, getFileByHash, moveFile } from "./api";

const tempFolder = path.join(__dirname, "../temp");

export default function initFunctions(publicFolder: string) {
  const resolveFilePath = (req) =>
    path.join(publicFolder, decodeURI(req.url.substring(7, req.url.length)));

  const extensionToCategotry = (extension: string) => {
    const category = Object.keys(extensions).find((key) =>
      extensions[key].includes(extension)
    );
    return category ? category : "other";
  };

  const returnAllFiles = (dirPath: string, arrayOfFiles?: string[]) => {
    const files = fs.readdirSync(dirPath);
    let fileArray = arrayOfFiles ? arrayOfFiles : [];
    files.forEach(function (file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        fileArray = returnAllFiles(dirPath + "/" + file, fileArray);
      } else {
        fileArray.push(
          path.join(__dirname, dirPath, "/", file).split("public/")[1]
        );
      }
    });
    return fileArray;
  };

  const getFile = async (req, res) => {
    try {
      const pathToFile = resolveFilePath(req);
      res.status(200).sendFile(pathToFile);
    } catch (err) {
      throw new Error(err);
    }
  };

  const getAllFiles = async (req, res) => {
    try {
      const allFiles = returnAllFiles(publicFolder);
      return res.status(200).send(allFiles);
    } catch (err) {
      throw new Error(err);
    }
  };

  // TODO try catch na etapy

  const uploadFile = async (req, res) => {
    try {
      if (!req.files) {
        return res.status(400).send("No files were uploaded.");
      } else {
        const authHeader = req.headers.authorization;

        const client = createClient({
          url: process.env.DB_SERVER,
          // exchanges: [dedupExchange, cacheExchange, fetchExchange],
          fetchOptions: () => {
            return {
              headers: { authorization: authHeader ? authHeader : "" },
            };
          },
        });

        const fileName = await req.files.file.name;
        const tempPath = path.join(tempFolder, fileName);
        await req.files.file.mv(tempPath);
        const constPath = path.join(publicFolder, fileName);
        const hash = hashes.getFileHash(tempPath);
        const queryResult = await client
          .query(getFileByHash, { hash })
          .toPromise();
        let fileInfo = queryResult.data && queryResult.data.fileByHash;
        // console.log("queryResult");
        // console.log(queryResult.data);

        if (fileInfo && fileInfo.id) {
          console.log("File already exists");
          fs.unlinkSync(tempPath);
          return res.status(200).send(fileInfo);
        } else {
          console.log("Creating file");
          fs.renameSync(tempPath, constPath);

          const folder = req.body.folder;
          const stats = fs.statSync(constPath);
          const fileSizeInBytes = stats.size;
          const extension = path.extname(constPath);
          const category = extensionToCategotry(extension.substring(1));

          const fileData = {
            name: fileName,
            hash: hash,
            category: category,
            size: fileSizeInBytes,
            last_modified: new Date().toISOString(),
            folder: folder,
            url: `/files/${fileName}`,
            typename: "File",
          };
          const mutationResult = await client
            .mutation(createFile, { data: fileData })
            .toPromise();
          const error = mutationResult.error && mutationResult.error.message;
          if (error) {
            throw new Error(error);
          }

          fileInfo = mutationResult.data && mutationResult.data.createFile;
          // console.log("fileInfo");
          // console.log(fileInfo);

          return res.status(200).send(fileInfo);
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
      fs.unlinkSync(pathToFile);
      return res.status(200).send("ok");
    } catch (err) {
      throw new Error(err);
    }
  };

  const getDiskUsage = async (req, res) => {
    checkDiskSpace("/").then((diskSpace) => {
      res.status(200).send(diskSpace);
      console.log(diskSpace);
      // {
      //     diskPath: '/',
      //     free: 12345678,
      //     size: 98756432
      // }
      // Note: `free` and `size` are in bytes
    });
  };

  return { getFile, getAllFiles, uploadFile, deleteFile, getDiskUsage };
}
