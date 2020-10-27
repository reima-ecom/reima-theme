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

export const collectionBulkQuery: BulkQuery = `
{
  collections {
    edges {
      node {
        id
        handle
        title
        descriptionHtml
        publishedOnCurrentPublication
        seo {
          title
          description
        }
        products {
          edges {
            node {
              id
              handle
              publishedOnCurrentPublication
              seo {
                title
                description
              }
            }
          }
        }
      }
    }
  }
}
`;

export type CollectionShopify = {
  id: ID;
  handle: string;
  title: string;
  descriptionHtml: string;
  publishedOnCurrentPublication: boolean;
  seo: {
    title: string;
    description: string;
  };
};

export type CollectionProductShopify = {
  id: string;
  handle: string;
  publishedOnCurrentPublication: boolean;
  __parentId: ID;
};

export type CollectionTypeShopify = CollectionShopify | CollectionProductShopify;

export type Jsonl = string;

export const toCollectionTypeShopify = (json: string) => JSON.parse(json) as CollectionTypeShopify;
