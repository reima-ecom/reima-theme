import {
  jsonlToObjects,
} from "./domain.ts";
import {
  createAdminQueryable,
} from "./graphql.ts";
import {
  collectionBulkQuery,
  Jsonl,
} from "./queries.ts";
import {
  createBulkOperation,
  getBulkOperationUrlWhenReady,
} from "./bulk-operation.ts";
import {
  serializeContent,
  writeFileToDir,
  deleteDirectory,
  readFilesFromDir,
  deserializeContent,
} from "./filesystem.ts";
import { toContent } from "./content.ts";

// file downloading

const download = async <T extends string>(url: string) => {
  const response = await fetch(url);
  return await response.text() as T;
};

const log = (description: string, logValue: boolean = true) =>
  (input: any) => {
    console.log(description);
    if (logValue) console.log(input);
    return input;
  };

function* chunk(
  array: any[],
  size: number,
): Generator<any[], undefined, undefined> {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
  return;
}

const runInBatches = (operationsPerBatch: number) =>
  (fn: (value: any) => any) =>
    async (inputArray: any[]) => {
      console.log(
        `Running batched await operation ${inputArray.length} by ${operationsPerBatch}...`,
      );
      console.time("Done");
      for (const partialArray of chunk(inputArray, operationsPerBatch)) {
        await Promise.all(partialArray.map(fn));
      }
      console.timeEnd("Done");
    };

// main workflow

export default async function syncCollections(
  shopifyShop: string,
  shopifyBasicAuth: string,
  collectionsDir: string,
  stringifier: (obj: object) => string,
  parser: (str: string) => unknown,
) {
  // set up dependencies
  const adminQueryable = createAdminQueryable(
    shopifyShop,
    shopifyBasicAuth,
  );
  const runBulkQuery = createBulkOperation(adminQueryable);
  const runCollectionBulkQuery = () => runBulkQuery(collectionBulkQuery);
  const getBulkOperationUrl = () =>
    getBulkOperationUrlWhenReady(adminQueryable);
  const serialize = serializeContent(stringifier);
  const write = writeFileToDir(collectionsDir);

  // get jsonl
  const jsonl: Jsonl = await Promise.resolve()
    .then(log("Running bulk query...", false))
    .then(runCollectionBulkQuery)
    .then(getBulkOperationUrl)
    .then(log("Bulk operation url:"))
    .then(download);

  // create files
  const files = jsonlToObjects(jsonl)
    .map(toContent)
    .map(serialize);

  console.log("Writing files...");

  // read existing files
  await Promise.resolve()
    .then(readFilesFromDir(collectionsDir))
    .then((arr) => arr.map(deserializeContent(parser)))
    .then(log("Existing content:"));

  // write
  await deleteDirectory(collectionsDir);
  const batch = runInBatches(50);
  await Promise.resolve(files)
    .then(batch(write));

  console.log("Success!");
}
