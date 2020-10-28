import { CollectionType, jsonlToObjects } from "./domain.ts";
import {
  ContentAction,
  createAdminQueryable,
  createBulkOperation,
  deleteDirectory,
  deserializeContent,
  FileAction,
  getBulkOperationUrlWhenReady,
  log,
  map,
  readFilesFromDir,
  serializeContent,
  writeFileToDir,
} from "./deps.ts";
import { collectionBulkQuery } from "./queries.ts";
import {
  CollectionTypeContent,
  toContent,
  ToContentWithType,
} from "./content.ts";
import { Content as FileContent, runContentAction } from "../lib/files/mod.ts";

// file downloading

const download = async <T extends string>(url: string) => {
  const response = await fetch(url);
  return await response.text() as T;
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

/**
 * Get file actions (remove/write) by comparing the current contents and
 * the newly imported contents. The most important functionality is to leave
 * existing collections (that have not been deleted) as-is, since these might
 * have been edited.
 * 
 * Details of processing:
 * - Collections in both arrays: do nothing (do not add to actions)
 * - New collections not existing currently: mark for writing (create or overwrite) 
 * - Current collections not existing in imported contents: mark for deletion
 * - Collection products in both arrays: mark for writing (overwrit)
 * - Current collection products not existing in imported contents: mark for deletion
 */
export const generateContentActions = ({
  currentContents,
  newContents,
}: {
  currentContents: CollectionTypeContent[];
  newContents: CollectionTypeContent[];
}): ContentAction[] => {
  const actions: ContentAction[] = [];
  // process new contents
  for (const newContent of newContents) {
    // check if imported contents exist currently and add write if not
    if (!currentContents.find((current) => current.path === newContent.path)) {
      actions.push({
        action: FileAction.Write,
        content: newContent,
      });
    } else if (newContent.type === "product") {
      // add all products for writing
      actions.push({
        action: FileAction.Write,
        content: newContent,
      });
    }
  }
  // check if current contents still exist and add remove if not
  for (const currentContent of currentContents) {
    if (!newContents.find((newCont) => newCont.path === currentContent.path)) {
      actions.push({
        action: FileAction.Remove,
        content: currentContent,
      });
    }
  }
  return actions;
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
  const contentActionRunner = runContentAction(collectionsDir, stringifier);

  // get new content
  const newContents = await Promise.resolve()
    .then(log("Running bulk query...", false))
    .then(runCollectionBulkQuery)
    .then(getBulkOperationUrl)
    .then(log("Bulk operation url:"))
    .then(download)
    .then(jsonlToObjects)
    .then(map<ToContentWithType<CollectionType>>(toContent));

  // get current content
  const currentContents = await Promise.resolve()
    .then(readFilesFromDir(collectionsDir))
    .then(map(deserializeContent(parser)))
    .then(map<ToContentWithType<FileContent>>(toContent));

  console.log("Writing files...");

  // create and execute file actions
  const batch = runInBatches(50);
  await Promise.resolve({ currentContents, newContents })
    .then(generateContentActions)
    .then(batch(contentActionRunner));

  console.log("Success!");
}
