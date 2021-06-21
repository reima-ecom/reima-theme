import {
  createAdminQueryable,
  createBulkOperation,
  getBulkOperationUrlWhenReady,
} from "../lib/graphql/mod.ts";

// file downloading

const download = async <T extends string>(url: string) => {
  const response = await fetch(url);
  return await response.text() as T;
};

// query
const inventoryIdsBulkQuery = `
  {
    inventoryItems(first: 100) {
      edges {
        node {
          legacyResourceId
          sku
        }
      }
    }
  }
`;

// main workflow

export async function getInventoryIds(
  shopifyShop: string,
  shopifyBasicAuth: string,
) {
  // set up dependencies
  const adminQueryable = createAdminQueryable(
    shopifyShop,
    shopifyBasicAuth,
  );
  const runBulkQuery = createBulkOperation(adminQueryable);
  const runCollectionBulkQuery = () => runBulkQuery(inventoryIdsBulkQuery);
  const getBulkOperationUrl = () =>
    getBulkOperationUrlWhenReady(adminQueryable);

  // get new content
  return await Promise.resolve()
    .then(runCollectionBulkQuery)
    .then(getBulkOperationUrl)
    .then(download)
}
