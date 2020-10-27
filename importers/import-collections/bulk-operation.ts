import { GraphQLQueryable } from "./graphql.ts";
import {
  createBulkQuery,
  BulkQuery,
  BulkQueryResponse,
  CurrentBulkOperation,
  currentBulkOperation,
} from "./queries.ts";

function createYieldableQuery<T>(
  queryable: GraphQLQueryable,
) {
  async function* getNext(graphQl: string) {
    while (true) {
      yield queryable<T>(graphQl);
    }
  }
  return getNext;
}

export const createBulkOperation = (adminQuery: GraphQLQueryable) =>
  async (query: BulkQuery) => {
    const graphQl = createBulkQuery(query);

    const { bulkOperationRunQuery: { bulkOperation, userErrors } } =
      await adminQuery<BulkQueryResponse>(graphQl);

    if (userErrors.length) {
      console.error(userErrors);
      throw new Error("Could not create bulk query");
    }

    return bulkOperation;
  };

export const getBulkOperationUrlWhenReady = async (
  adminQuery: GraphQLQueryable,
) => {
  const bulkOperationYieldable = createYieldableQuery<CurrentBulkOperation>(
    adminQuery,
  )(currentBulkOperation);
  // store current status here
  let currentStatus = "";
  // show the user we're still waiting every once in a while
  const statusLoggerIntervalId = setInterval(() => {
    console.log(`Still waiting for bulk query (${currentStatus})...`);
  }, 15000);

  for await (const result of bulkOperationYieldable) {
    const { currentBulkOperation: { status, url } } = result;
    currentStatus = status;
    if (status === "COMPLETED") {
      // clear logging interval
      clearInterval(statusLoggerIntervalId);
      return url;
    }
  }

  throw new Error("Bulk operation not for awaitable");
};
