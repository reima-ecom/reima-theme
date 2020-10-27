import updateFrontmatter from "./workflows.ts";

const [githubRepo, targetDir = "."] = Deno.args;

const usage = `
Get forestry frontmatter definitions from a repository.
Copies definitions but leaves existing \`pages\` property.

USAGE:
$> deno run -A cmd.ts [source repo] [target directory]

\`target directory\` is optional and defaults to the current dir.
This directory should be the root of the repo.

ENVIRONMENT VARIABLES needed:
\`GITHUB_PAT\`: Personal access token for GitHub
`;

const githubToken = Deno.env.get("GITHUB_PAT");

try {
  if (!githubToken) throw new Error("GitHub token not set");
  if (!githubRepo) throw new Error("Source repo not set");
  await updateFrontmatter(githubRepo, targetDir, githubToken);
} catch (error) {
  console.error(error);
  console.log(usage);
  Deno.exit(1);
}
