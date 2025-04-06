import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { logger } from "../ui/logger.js";
import { ConfigSchema } from "./schema.js";

export const defaultConfigPath = join(process.cwd(), "aethr.config.mjs");
export const defaultProfile = "default";
export const exampleConfigPath = join(
  import.meta.dirname,
  "..",
  "..",
  "default.aethr.config.mjs",
);

export const readConfigFile = async (file: string): Promise<ConfigSchema> => {
  const module = (await import(pathToFileURL(file).href)) as {
    default: unknown;
  };
  return ConfigSchema.parse(module.default);
};

export const initializeDefaultConfigFile = async (file: string) => {
  const content = await readFile(exampleConfigPath, "utf-8");
  try {
    await writeFile(file, content, { flag: "wx" });
    logger.info(`Default config file created: ${file}.`);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") {
      logger.debug(
        `Config file already exists, skipping creation: ${defaultConfigPath}`,
      );
    } else {
      throw error;
    }
  }
};
