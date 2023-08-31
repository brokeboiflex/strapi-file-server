import fs from "fs";
import path from "path";
import { createClient } from "@urql/core";
import checkDiskSpace from "check-disk-space";

import extensions from "./file-extensions";
import hashes from "./hashes";
import { createFile, getFileByHash, getFileById } from "./api";
import log from "./log";
import _ from "lodash";

// import { fileTypeFromFile } from "file-type";

const tempFolder = path.join(__dirname, "../temp");

export default function initFunctions(publicFolder: string) {
  const getFileInfo = async (req: any, query: any, variables: object) => {
    const authHeader = await req.headers.authorization;
    const client = createClient({
      url: process.env.DB_SERVER,
      // exchanges: [dedupExchange, cacheExchange, fetchExchange],
      fetchOptions: () => {
        return {
          headers: authHeader ? { authorization: authHeader } : {},
        };
      },
    });

    const queryResult = await client.query(query, variables).toPromise();
    let fileInfo: any =
      (await queryResult.data) && (await Object.values(queryResult.data)[0]);
    return fileInfo;
  };

  const resolveFilePath = async (req) => {
    const fileId = decodeURI(req.url).substring(7, req.url.length);
    // log(fileId, "magenta");
    const fileInfo = await getFileInfo(req, getFileById, { id: fileId });
    // log(fileInfo, "magenta");
    if (fileInfo) {
      const { hash, extension, name } = fileInfo;
      const filePath = hash + extension;
      return { filePath: path.join(publicFolder, filePath), fileName: name };
    } else return { filePath: publicFolder };
  };

  const extensionToCategotry = (extension: string) => {
    const category = Object.keys(extensions).find((key) =>
      extensions[key].includes(extension.substring(1))
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
      const { filePath, fileName } = await resolveFilePath(req);

      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
      res.status(200).sendFile(filePath);
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

        const fileName = decodeURI(req.files.file.name);
        const folder = req.body.folder;
        const tempPath = path.join(tempFolder, fileName);
        await req.files.file.mv(tempPath);
        let extension = "";
        const extensionFromName = path.extname(tempPath);
        if (extensionFromName) {
          extension = extensionFromName;
        } else {
          const { fileTypeFromFile } = await import("file-type");
          extension = `.${(await fileTypeFromFile(tempPath)).ext}`;
        }
        const hash = hashes.getFileHash(tempPath);
        // filename is its hash + extension to avoid storing duplicate files with different names
        const constPath = path.join(publicFolder, hash + extension);
        let fileInfo = await getFileInfo(req, getFileByHash, { hash });

        if (fileInfo && fileInfo.id) {
          log("File already uploaded", "blue");
          fs.unlinkSync(tempPath);
        } else {
          log("Saving file", "blue");
          fs.renameSync(tempPath, constPath);
        }
        if (!fileInfo || folder !== fileInfo.folder) {
          const fileSizeInBytes =
            fileInfo && _.isNumber(fileInfo.size)
              ? fileInfo.size
              : fs.statSync(constPath).size;

          const category =
            fileInfo && fileInfo.category
              ? fileInfo.category
              : extensionToCategotry(extension);

          const fileData = {
            name: fileName,
            extension: extension,
            hash: hash,
            size: fileSizeInBytes,
            category: category,
            last_modified: new Date().toISOString(),
            path: folder,
            //
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
          return res.status(201).send(fileInfo);
        } else {
          log("File already exists at this location", "red");
          return res.status(200).send(fileInfo);
        }
      }
    } catch (err) {
      log("Upload error", "red");
      throw new Error(err);
    }
  };

  const copyFileFromURL = async (req, res) => {
    try {
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

      const folder = req.body.folder;
      const URL = req.body.url;

      const fileName = decodeURI(req.files.file.name);
      const tempPath = path.join(tempFolder, fileName);
      await req.files.file.mv(tempPath);
      let extension = "";
      const extensionFromName = path.extname(tempPath);
      if (extensionFromName) {
        extension = extensionFromName;
      } else {
        const { fileTypeFromFile } = await import("file-type");
        extension = `.${(await fileTypeFromFile(tempPath)).ext}`;
      }
      const hash = hashes.getFileHash(tempPath);
      // filename is its hash + extension to avoid storing duplicate files with different names
      const constPath = path.join(publicFolder, hash + extension);
      let fileInfo = await getFileInfo(req, getFileByHash, { hash });

      if (fileInfo && fileInfo.id) {
        log("File already uploaded", "blue");
        fs.unlinkSync(tempPath);
      } else {
        log("Saving file", "blue");
        fs.renameSync(tempPath, constPath);
      }
      if (!fileInfo || folder !== fileInfo.folder) {
        const fileSizeInBytes =
          fileInfo && _.isNumber(fileInfo.size)
            ? fileInfo.size
            : fs.statSync(constPath).size;

        const category =
          fileInfo && fileInfo.category
            ? fileInfo.category
            : extensionToCategotry(extension);

        const fileData = {
          name: fileName,
          extension: extension,
          hash: hash,
          size: fileSizeInBytes,
          category: category,
          last_modified: new Date().toISOString(),
          path: folder,
          //
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
        return res.status(201).send(fileInfo);
      } else {
        log("File already exists at this location", "red");
        return res.status(200).send(fileInfo);
      }
    } catch (err) {
      log("Upload error", "red");
      throw new Error(err);
    }
  };

  const deleteFile = async (req, res) => {
    try {
      const filePath = decodeURI(req.url.substring(7, req.url.length));
      const pathToFile = path.join(publicFolder, filePath);
      // log(pathToFile, "magenta");
      fs.unlinkSync(pathToFile);
      return res.status(200).send("ok");
    } catch (err) {
      throw new Error(err);
    }
  };

  const getDiskUsage = async (req, res) => {
    checkDiskSpace(__dirname).then((diskSpace) => {
      res.status(200).send(diskSpace);
    });
  };

  return { getFile, getAllFiles, uploadFile, deleteFile, getDiskUsage };
}
