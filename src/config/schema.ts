import { z } from "zod";

import { McpServersConfig } from "../mcp/config.js";

export const ProfileSchema = z.object({
  mcpServers: McpServersConfig,
  runOptions: z.object({
    recursionLimit: z.number().int().nonnegative(),
    temperature: z.number().min(0).max(1),
    thinkTool: z.boolean(),
    reasoning: z.boolean(),
  }),
});
export type ProfileSchema = z.infer<typeof ProfileSchema>;

export const ConfigSchema = z.object({
  profiles: z.record(z.string(), ProfileSchema),
});
export type ConfigSchema = z.infer<typeof ConfigSchema>;
