import { z } from "zod";

export const StdioServerConfig = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});
export type StdioServerConfig = z.infer<typeof StdioServerConfig>;

// TODO: Support SSE server
export const McpServersConfig = z.record(z.string(), StdioServerConfig);
export type McpServersConfig = z.infer<typeof McpServersConfig>;
