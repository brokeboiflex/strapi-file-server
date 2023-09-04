import log from "../../log";
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
          publishedAt: new Date().toISOString(),
        };
        const mutationResult = await client
          .mutation(createFile, { data: fileData })
          .toPromise();
        const error = mutationResult.error && mutationResult.error.message;
        if (error) {
          throw new Error(error);
        }
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
