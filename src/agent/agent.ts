import { BaseMessageLike, isAIMessageChunk } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { z } from "zod";

import { logThought } from "../ui/think-tool.js";

export const prompt = `
You are a QA agent, testing a web application step-by-step. Follow these rules exactly:

1. GENERAL BEHAVIOR
  a. Think "step-by-step" before each action.
  b. Honor the user's specified step order; do not reorder steps.
  c. Mirror the language used by the user's instruction for your response.

2. TOOL USAGE
  a. Use only one MCP tool per response—never more than one.
  b. Tool names may be prefixed, e.g. "<name>__playwright__browser_navigate".
  c. When "think_tool" is available, invoke it first to plan your next action, then call the real tool.
  d. Use "browser_install" tool if browser is not installed.

3. HANDLING VARIABLES
  a. Do **not** replace tokens in "\${…}"; pass them through literally.
  b. Example: for "\${URL}", use "\${URL}" as-is, do not generate or guess the URL.

4. ELEMENT REFERENCES
  a. Always use the "ref" from the **latest** snapshot ("e<element_id>").
  b. Do **not** reuse stale refs from earlier snapshots.

5. ASSERTIONS
  a. When asserting, use the **user-provided** expected value exactly as given.
  b. Do not generate or derive expected values yourself.
  c. If an assertion fails, stop the test immediately—do not retry.
  d. In your result summary, state whether you asserted “on element” or “on page.”

6. TOOL RESPONSE
  a. **Every** time you respond, you **must** choose **one and only one** tool.
  b. You may **not** invoke multiple tools in a single response.

7. TEST COMPLETION
  a. When the scenario ends, output a final summary:
    - List each step you performed.
    - State the overall verdict (PASS/FAIL).
`;

export const responseFormat = z.object({
  summary: z
    .string()
    .describe(
      "The summary of the whole test, what you saw and what you did, step-by-step. Use the same language as the original user's input. When you describe the assertion, mention whether it is asserted against an element or the page.",
    ),
  result: z
    .enum(["PASS", "FAIL"])
    .describe(
      "The final verdict of the entire test. It must be either PASS or FAIL.",
    ),
});
export type ResponseFormat = z.infer<typeof responseFormat>;

interface Input {
  messages: BaseMessageLike[];
}
type Options = Partial<Parameters<Runnable["streamEvents"]>[1]>;
type StreamToken = (token: string) => void;
// Following the prebuilt ReAct agent's format.
const output = z.object({
  data: z.object({
    output: z.object({
      structuredResponse: responseFormat,
    }),
  }),
});

export const thinkTool = tool(
  ({ thought }) => {
    logThought(thought);
    return "Call the next tool you picked. Don't call this tool in a row.";
  },
  {
    name: "think_tool",
    description:
      "Call this tool every time before actually calling the actual tool and think your reasoning process. The call sequence is: call this tool, then call the actual tool. Never call this tool in a row.",
    schema: z.object({
      thought: z
        .string()
        .describe(
          "A reasoning about the next tool call. Use the same language as the original user's input.",
        ),
    }),
  },
);

export const invokeAgent = async (
  agent: Runnable,
  input: Input,
  streamToken: StreamToken,
  options?: Options,
): Promise<ResponseFormat> => {
  try {
    const stream = agent.streamEvents(input, { version: "v2", ...options });
    let lastStreamEvent: StreamEvent | undefined;
    for await (const streamEvent of stream) {
      lastStreamEvent = streamEvent;
      const { event, data } = streamEvent;
      if (
        event === "on_chat_model_stream" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        isAIMessageChunk(data.chunk)
      ) {
        const { tool_call_chunks } = data.chunk;
        if (
          tool_call_chunks &&
          tool_call_chunks.length === 0 &&
          data.chunk.text
        ) {
          streamToken(data.chunk.text);
        }
      }
    }
    const parsed = output.safeParse(lastStreamEvent);
    return parsed.success
      ? parsed.data.data.output.structuredResponse
      : {
          result: "FAIL",
          summary: `Error: Invalid format of the last event ${JSON.stringify(lastStreamEvent)} (${parsed.error.message})`,
        };
  } catch (error) {
    return {
      result: "FAIL",
      summary: `Error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
