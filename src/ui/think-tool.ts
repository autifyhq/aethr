import chalk from "chalk";

import { logger } from "./logger.js";

export const logThought = (thought: string) => {
  logger.info(`LLM think: ${chalk.yellow(thought)}`);
};
