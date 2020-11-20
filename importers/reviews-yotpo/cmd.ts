import workflow from "./workflow.ts";

const usage = `
Writes all reviews found in Yotpo into the data directory. Creates one
file \`data/reviews.json\` with the reviews and bottom line per product.

Usage:

deno run -A reviews-yotpo/cmd.ts YOTPO_APP_KEY [DATA_DIRECTORY=./data]

Needs the YOTPO_SECRET environment variable.
`;

const [yotpoAppKey, dataDir = "./data"] = Deno.args;
const yotpoSecret = Deno.env.get("YOTPO_SECRET");

try {
  if (!yotpoAppKey) throw new Error("YOTPO_APP_KEY argument not set");
  if (!yotpoSecret) throw new Error("YOTPO_SECRET env var not set");
  console.time('Success in');
  const result = await workflow(yotpoAppKey, yotpoSecret, dataDir);
  console.log(result);
  console.timeEnd('Success in');
} catch (error) {
  console.log()
  console.error('ERROR:', error.message);
  console.log(usage);
}
