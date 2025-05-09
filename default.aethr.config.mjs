/** @type {import("aethr/dist/config/schema.js").ConfigSchema} */
export default {
  profiles: {
    default: {
      mcpServers: {
        playwright: {
          command: "npx",
          args: [
            "-y",
            "@aethr/playwright-mcp@latest",
            ...["--browser", "chromium"],
            ...(process.env.CI ? ["--headless"] : []),
            ...["--user-data-dir", "${TEMP_DIR}"], // ${TEMP_DIR} is given by Aethr per run and cleared after the run
          ],
          env: {
            FORCE_COLOR: "0", // To avoid unnecessary color codes in the assertion failure message
            TRACE: "./trace.zip", // Location to store the trace file
          },
          exclude: [
            "browser_close",
            "browser_take_screenshot",
            "browser_generate_playwright_test",
          ],
        },
      },
      runOptions: {
        recursionLimit: 50,
        temperature: 0.7,
        thinkTool: false,
        reasoning: false,
      },
    },
  },
};
