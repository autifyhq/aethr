import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { logger } from "../ui/logger.js";

export const loadTestFile = async (filePath: string): Promise<string> => {
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return await loadTestFileFromUrl(filePath);
  } else {
    return await loadTestFileFromFileSystem(filePath);
  }
};

const loadTestFileFromUrl = async (url: string): Promise<string> => {
  logger.info(`Reading test file from URL: ${url}`);
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to load test file from URL: ${url}`);
  const fileContent = await response.text();
  logger.info(`Test file:\n${fileContent}`);
  return fileContent;
};

const loadTestFileFromFileSystem = async (
  filePath: string,
): Promise<string> => {
  logger.info(`Reading test file from path: ${filePath}`);
  if (!existsSync(filePath))
    throw new Error(`Test file not found: ${filePath}`);
  const fileContent = (await readFile(filePath)).toString();
  logger.info(`Test file:\n${fileContent}`);
  return fileContent;
};
