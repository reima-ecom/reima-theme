import { map, yaml, log } from "./deps.ts";

const FRONTMATTER_PATH = ".forestry/front_matter/templates";

type FrontmatterSpecs = {
  [key: string]: any;
  pages?: string[];
};

type FileWithContents = {
  filename: string;
  contents: string;
};

type FileParsed = {
  filename: string;
  parsed: FrontmatterSpecs;
};

type FileWithDefinitionOnly = {
  filename: string;
  definition: Omit<FrontmatterSpecs, "pages">;
};

type FileWithPages = {
  filename: string;
  pages: string[];
};

type FileWithDefinition = {
  filename: string;
  definition: FrontmatterSpecs;
};

const readDirGithub = (githubRepo: string, path: string, githubToken: string) =>
  async (): Promise<string[]> => {
    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/contents/${path}`,
      {
        headers: {
          "Accept": "application/vnd.github.v3",
          "Authorization": `token ${githubToken}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Could not fetch from GitHub: ${response.statusText}`);
    }
    const contents: { name: string }[] = await response.json();
    return contents.map((entry) => entry.name);
  };

const readFileGithub = (
  githubRepo: string,
  path: string,
  githubToken: string,
) =>
  async (filename: string): Promise<FileWithContents> => {
    const url =
      `https://api.github.com/repos/${githubRepo}/contents/${path}/${filename}`;
    const response = await fetch(
      url,
      {
        headers: {
          // raw means raw file
          "Accept": "application/vnd.github.v3.raw",
          "Authorization": `token ${githubToken}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Could not fetch from GitHub: ${response.statusText}`);
    }
    return {
      filename: filename,
      contents: await response.text(),
    };
  };

const readDir = (dirpath: string) =>
  async (): Promise<string[]> => {
    try {
      const filenames: string[] = [];
      for await (const dirEntry of Deno.readDir(dirpath)) {
        if (dirEntry.isFile) filenames.push(dirEntry.name);
      }
      return filenames;
    } catch (error) {
      // swallow and return empty array if not found
      if (error.name === "NotFound") return [];
      throw error;
    }
  };

const readFile = (dirpath: string) =>
  async (filename: string): Promise<FileWithContents> => {
    const contents = await Deno.readTextFile(`${dirpath}/${filename}`);
    return {
      filename,
      contents,
    };
  };

export const parseTemplateContents = (
  templateWithContents: FileWithContents,
): FileParsed => {
  const { filename, contents } = templateWithContents;
  const parsed = yaml.parse(contents) as object;
  return {
    filename,
    parsed,
  };
};

export const removeTemplatePage = (
  template: FileParsed,
): FileWithDefinitionOnly => {
  const { pages, ...definition } = template.parsed;
  return {
    filename: template.filename,
    definition,
  };
};

export const keepTemplatePagesOnly = (
  template: FileParsed,
): FileWithPages => {
  const { pages } = template.parsed;
  return {
    filename: template.filename,
    pages: pages || [],
  };
};

export const joinPagesIntoTemplateDefinitions = (
  filesWithPages: FileWithPages[],
  filesWithDefinition: FileWithDefinition[],
): FileWithDefinition[] => {
  const findFile = (filename: string) =>
    (file: FileWithPages) => file.filename === filename;
  return filesWithDefinition.map((file) => {
    const fileWithPages = filesWithPages.find(findFile(file.filename));
    if (fileWithPages && fileWithPages.pages) {
      return {
        filename: file.filename,
        definition: {
          ...file.definition,
          pages: fileWithPages.pages,
        },
      };
    }
    return file;
  });
};

export const serializeTemplateContents = (
  template: FileWithDefinition,
): FileWithContents => {
  const { filename, definition } = template;
  const contents = yaml.stringify(definition, { noArrayIndent: true });
  return {
    filename,
    contents: `---\n${contents}`,
  };
};

export const writeFrontmatterTemplate = (dirpath: string) =>
  async (templateWithContent: FileWithContents): Promise<void> =>
    Deno.writeTextFile(
      `${dirpath}/${templateWithContent.filename}`,
      templateWithContent.contents,
    );

const rimraf = (path: string) =>
  async (arg: any) => {
    try {
      await Deno.remove(path, { recursive: true });
    } catch (error) {
      if (error.name !== "NotFound") throw error;
    }
    return arg;
  };

const mkdir = (path: string) =>
  async (arg: any) => {
    try {
      await Deno.mkdir(path, { recursive: true });
    } catch (error) {
      if (error.name !== "NotFound") throw error;
    }
    return arg;
  };

const updateFrontmatter = async (
  githubRepo: string,
  targetDir: string,
  githubToken: string,
): Promise<void> => {
  // read source dir fm into array
  console.log(`Getting front matter templates from ${githubRepo}`);
  const sourceDefinitions = await Promise
    .resolve()
    .then(readDirGithub(githubRepo, FRONTMATTER_PATH, githubToken))
    .then(map(readFileGithub(githubRepo, FRONTMATTER_PATH, githubToken)))
    .then(map(parseTemplateContents))
    .then(map(removeTemplatePage));
  console.log("Got source front matter files");

  const targetDirPath = `${targetDir}/${FRONTMATTER_PATH}`;

  // read target dir pages into array
  const targetPages = await Promise
    .resolve()
    .then(readDir(targetDirPath))
    .then(map(readFile(targetDirPath)))
    .then(map(parseTemplateContents))
    .then(map(keepTemplatePagesOnly));
  console.log("Got possible pages from target frontmatter");

  // join target pages into source front matter
  const templatesWithPages = joinPagesIntoTemplateDefinitions(
    targetPages,
    sourceDefinitions,
  );

  // write to dir
  await Promise
    .resolve(templatesWithPages)
    .then(map(serializeTemplateContents))
    .then(rimraf(targetDirPath))
    .then(mkdir(targetDirPath))
    .then(map(writeFrontmatterTemplate(targetDirPath)));
  console.log("Success!");
};

export default updateFrontmatter;
