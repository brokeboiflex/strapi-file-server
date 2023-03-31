import { gql } from "@urql/core";

export const getFileByHash = gql`
  query GetFileByHash($hash: String) {
    fileByHash(hash: $hash) {
      id
      name
      hash
      category
      size
      last_modified
      url
      folder
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
      category
      size
      last_modified
      url
      folder
      related
    }
  }
`;
