import chalk from "chalk";

import { ResponseFormat } from "../agent/agent.js";
import { logger } from "./logger.js";

export const logResponse = (response: ResponseFormat) => {
  const result =
    response.result === "PASS"
      ? chalk.bold.green(response.result)
      : chalk.bold.red(response.result);
  const summary =
    response.result === "PASS"
      ? chalk.white(response.summary)
      : chalk.red(response.summary);
  logger.info(`${chalk.bold("Test result:")} ${result}, Summary:\n${summary}`);
};
