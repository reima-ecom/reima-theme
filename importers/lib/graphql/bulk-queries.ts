import { GraphQLQuery } from "./graphql.ts";
import { ID } from "./node.ts";

export type BulkQuery = GraphQLQuery;

export const createBulkQuery = (graphQl: BulkQuery) =>
  `mutation {
    bulkOperationRunQuery(
     query: """${graphQl}"""
    ) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }`;

export type BulkQueryResponse = {
  bulkOperationRunQuery: {
    bulkOperation: {
      id: ID;
    };
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
};

export const currentBulkOperation: GraphQLQuery = `
  {
    currentBulkOperation {
      id
      status
      errorCode
      objectCount
      url
    }
  }`;

export type CurrentBulkOperation = {
  currentBulkOperation: {
    id: ID;
    status:
      | "CANCELED"
      | "CANCELING"
      | "COMPLETED"
      | "CREATED"
      | "EXPIRED"
      | "FAILED"
      | "RUNNING";
    objectCount: string;
    url: string;
    errorCode?: "ACCESS_DENIED" | "INTERNAL_SERVER_ERROR" | "TIMEOUT";
  };
};

export type Jsonl = string;
