export type File = {
  path: string;
  data: string;
};

export type Content = {
  path: string;
  content: object;
};

export const serializeContent = (stringifier: (obj: object) => string) =>
  (obj: Content): File => ({
    path: obj.path,
    data: `---\n${stringifier(obj.content)}\n---`,
  });

export const deserializeContent = (parser: (str: string) => unknown) =>
  (file: File): Content => {
    const frontmatter = file.data.split("---")[1].trim();
    return {
      path: file.path,
      content: parser(frontmatter) as object,
    };
  };

export const writeFileToDir = (dir: string) =>
  async (file: File) => {
    const path = `${dir}/${file.path}`;
    await Deno.mkdir(dirname(path), { recursive: true });
    await Deno.writeFile(
      path,
      new TextEncoder().encode(file.data),
    );
  };

export const deleteDirectory = async (dir: string) => {
  try {
    await Deno.remove(dir, { recursive: true });
  } catch (error) {
    // throw if this was something else than not found error
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
};

export const dirname = (path: string) => {
  const arr = path.split("/");
  arr.pop();
  return arr.join("/");
};

const readFilesRecursive = async (dir: string): Promise<File[]> => {
  const files: File[] = [];
  for await (const dirEntry of Deno.readDir(dir)) {
    if (dirEntry.isDirectory) {
      const subdirFiles = await readFilesRecursive(`${dir}/${dirEntry.name}`);
      files.push(...subdirFiles);
    } else if (dirEntry.isFile) {
      const path = `${dir}/${dirEntry.name}`;
      files.push({
        path,
        data: await Deno.readTextFile(path),
      });
    }
  }
  return files;
};

export const readFilesFromDir = (dir: string) =>
  async (): Promise<File[]> => {
    try {
      const files = await readFilesRecursive(dir);
      return files.map((file) => ({
        // remove initial dir path
        path: file.path.replace(`${dir}/`, ""),
        data: file.data,
      }));
    } catch (error) {
      return [];
    }
  };
