import { gql } from "@urql/core";

export const getFileByHash = gql`
  query GetFileByHash($hash: String) {
    fileByHash(hash: $hash) {
      id
      name
      extension
      hash
      size
      category
      last_modified
      path
    }
  }
`;

export const getFileByName = gql`
  query GetFileByName($name: String) {
    fileByName(name: $name) {
      id
      name
      extension
      hash
      size
      category
      last_modified
      path
    }
  }
`;

export const createFile = gql`
  mutation CreateFile($data: FileInput) {
    createFile(data: $data) {
      id
      name
      extension
      hash
      size
      category
      last_modified
      path
    }
  }
`;
