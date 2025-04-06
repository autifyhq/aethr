#!/usr/bin/env node
import { Command } from "@commander-js/extra-typings";
import dotenv from "dotenv";

import pkg from "../package.json" with { type: "json" };
import { runCommand } from "./cli/run-command.js";
import { defaultConfigPath, defaultProfile } from "./config/default.js";
import { logger } from "./ui/logger.js";

// Load environment variables from .env file
dotenv.config();

const program = new Command();

program
  .name("aethr")
  .description("Natural language test scenario runner agent with MCP tools")
  .version(pkg.version);

program
  .command("run")
  .description("Run a test scenario file")
  .argument("<file>", "Path to test scenario file")
  .option("-c --config-file <file>", "Config file path", defaultConfigPath)
  .option("-p --profile <name>", "Profile name", defaultProfile)
  .option(
    "-r, --recursion-limit <number>",
    "Set maximum recursion limit for the agent",
    parseInt,
  )
  .option("--temperature <number>", "Set temperature for LLM", parseFloat)
  .option("--think-tool", "Enable think tool")
  .option("--reasoning", "Enable reasoning parameter for MCP tools")
  .action(async (file, options) => {
    logger.info(`Aethr v${pkg.version}`);
    logger.info(options, `Run command: ${file}`);
    process.exitCode = await runCommand(file, options);
  });

program.parse();
