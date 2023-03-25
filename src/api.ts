import { gql } from "@urql/core";

export const getFileByHash = gql`
  query GetFileByHash($hash: String) {
    fileByHash(hash: $hash) {
      id
      name
      hash
      category {
        name
      }
      size
      last_modified
      url
      related
    }
  }
`;

export const createFile = gql`
  mutation CreateFile($data: FileInput) {
    createFile(data: $data) {
      id
      name
      hash
      category {
        name
      }
      size
      last_modified
      url
      related
    }
  }
`;

export const moveFile = (id: String, newPath: String) =>
  `{moveFile(id: ${id}, newPath: ${newPath}){
    


  }}`;
