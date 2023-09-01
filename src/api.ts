import { gql } from "@urql/core";

export const getFileById = gql`
  query GetFsFile($id: ID) {
    fsFile(id: $id) {
      data {
        id
        attributes {
          name
          extension
          hash
          size
          category
          last_modified
          path
        }
      }
    }
  }
`;

export const getFileByHash = gql`
  query GetFsFileByHash($hash: String) {
    fsFileByHash(hash: $hash) {
      data {
        id
        attributes {
          name
          extension
          hash
          size
          category
          last_modified
          path
        }
      }
    }
  }
`;

export const getFileByName = gql`
  query GetFsFileByName($name: String) {
    fsFileByName(name: $name) {
      data {
        id
        attributes {
          name
          extension
          hash
          size
          category
          last_modified
          path
        }
      }
    }
  }
`;

export const createFile = gql`
  mutation CreateFile($data: FsFileInput!) {
    createFsFile(data: $data) {
      data {
        id
        attributes {
          name
          extension
          hash
          size
          category
          last_modified
          path
        }
      }
    }
  }
`;

export default {
  getFileById,
  getFileByHash,
  getFileByName,
  createFile,
};
