const usage = `
Update Algolia index (replacing all objects) with the contents
of the specified json file.
Usage: deno -A cmd.ts [app id] [index name] [json file]
Requires the ALGOLIA_ADMIN_KEY environment variable to be set.
`;

const [appId, indexName, filePath] = Deno.args;
const ALGOLIA_ADMIN_KEY = Deno.env.get("ALGOLIA_ADMIN_KEY");

if (!appId || !indexName || !filePath || !ALGOLIA_ADMIN_KEY) {
  console.log(usage);
  Deno.exit(1);
}

// build the request body according to
// https://www.algolia.com/doc/rest-api/search/#batch-write-operations
const json = await Deno.readTextFile(filePath);
const objects = JSON.parse(json) as any[];
const body = {
  requests: [
    { action: "clear" },
  ],
};
body.requests.push(
  ...objects.map((o) => ({ action: "updateObject", body: o })),
);

// fire off the request
const response = await fetch(
  `https://${appId}.algolia.net/1/indexes/${indexName}/batch`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Algolia-Application-Id": appId,
      "X-Algolia-API-Key": ALGOLIA_ADMIN_KEY,
    },
    body: JSON.stringify(body),
  },
);

if (!response.ok) {
  console.error(response.status, response.statusText);
  console.error(await response.json());
  Deno.exit(1);
}

console.log("Updated algolia index");
