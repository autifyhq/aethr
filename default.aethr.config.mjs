/** @type {import("aethr/dist/config/schema.js").ConfigSchema} */
export default {
  profiles: {
    default: {
      mcpServers: {
        playwright: {
          command: "npx",
          args: [
            "-y",
            "@aethr/playwright-mcp@0.0.28-patch.0",
            ...["--browser", "chromium"],
            ...(process.env.CI ? ["--headless"] : []),
            ...["--isolated", "--no-sandbox"],
            ...["--output-dir", "./outputs"],
            ...["--save-trace"],
          ],
          env: {
            FORCE_COLOR: "0", // To avoid unnecessary color codes in the assertion failure message
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
