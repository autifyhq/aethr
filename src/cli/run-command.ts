import { temporaryDirectoryTask } from "tempy";

import { invokeAgent } from "../agent/agent.js";
import { createCustomAgent } from "../agent/custom-agent.js";
import { createPrebuiltReactAgent } from "../agent/prebuilt-react-agent.js";
import {
  defaultConfigPath,
  initializeDefaultConfigFile,
  readConfigFile,
} from "../config/default.js";
import { loadTestFile } from "../file/file.js";
import { createModel } from "../llm/model.js";
import { createMcpTools } from "../mcp/tools.js";
import { createMetrics } from "../metrics/metrics.js";
import type { RunCommandOptions } from "../types.js";
import { logger, streamToken } from "../ui/logger.js";
import { logResponse } from "../ui/response.js";
import { logTotalUsage, logUsage } from "../ui/usage.js";

/**
 * Run a test scenario file
 * @param filePath Path to the test scenario file
 * @param options Options for the test runner
 */
export async function runCommand(
  filePath: string,
  options: RunCommandOptions,
): Promise<number> {
  return temporaryDirectoryTask(async (tempDir) => {
    if (options.configFile === defaultConfigPath)
      await initializeDefaultConfigFile(defaultConfigPath);
    const config = await readConfigFile(options.configFile);
    const profileName = options.profile;
    const profile = config.profiles[profileName];
    logger.info(profile, `Profile: ${profileName}`);
    const runOptions = { ...profile.runOptions, ...options };
    logger.info(runOptions, "Run options");
    const { recursionLimit, temperature, thinkTool, reasoning } = runOptions;

    const model = createModel(process.env, { temperature });
    const metrics = createMetrics(model);
    metrics.onUsage(logUsage);

    const fileContent = await loadTestFile(filePath);
    const input = { messages: [{ role: "user", content: fileContent }] };

    const mcpTools = await createMcpTools(profile.mcpServers, model, {
      thinkTool,
      reasoning,
      tempDir,
    });

    try {
      const agent = process.env.CUSTOM_AGENT
        ? createCustomAgent(model.llm, mcpTools.tools)
        : createPrebuiltReactAgent(model.llm, mcpTools.tools);
      const response = await invokeAgent(agent, input, streamToken, {
        recursionLimit,
      });
      logResponse(response);
      return response.result === "PASS" ? 0 : 1;
    } catch (err) {
      logger.error(err, "Error running test");
      return 2;
    } finally {
      logTotalUsage(metrics.getTotalUsage());
      await mcpTools.close();
    }
  });
}
