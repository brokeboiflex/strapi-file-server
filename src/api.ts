export const getFileByHash = (hash: string) => `{fileByHash(hash: ${hash}){
    id
    name
    hash
    category
    size
    last_modified
    url
    related
  }}`;

export const moveFile = (id: String, newPath: String) =>
  `{moveFile(id: ${id}, newPath: ${newPath}){
    


  }}`;
