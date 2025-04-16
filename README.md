# Aethr /ˈiːθər/

Natural language test scenario runner agent with MCP tools.

## Overview

Aethr is a command-line AI agent that runs natural language test scenarios with LLM and MCP, with real-time terminal feedback. It bridges the gap between plain natural language test descriptions and automated testing.

## Demo

### Success example

![Aethr demo for successful scenario](https://github.com/autifyhq/aethr-demo/blob/main/success.gif)

### Failure example

![Aethr demo for failed scenario](https://github.com/autifyhq/aethr-demo/blob/main/failure.gif)

## Features

- Natural language test file definition
- AI agent for test plan and execution
- MCP tool calling to automate test execution
- CLI-based i.e. CI friendly

## Prerequisites

- Install Node.js 22+ by any method you like
- Setup API keys or credentials for one of LLM providers below:
  - OpenAIm OpenRouter, Anthropic, Amazon Bedrock, Google GenAI, Google VertexAI, Azure OpenAI, Groq, Cohere, Ollama
- Put model name and keys/credentials in environment variables (or `.env` file)

  ```shell
  # Model names here are just examples.
  # As long as the model supports tool calling, you can try it out with Aethr.

  OPENAI_MODEL=gpt-4o-mini
  OPENAI_API_KEY=
  # or
  OPENROUTER_MODEL=openai/gpt-4o-mini
  OPENROUTER_API_KEY=
  # or
  ANTHROPIC_MODEL=claude-3-7-sonnet-20250219
  ANTHROPIC_API_KEY=
  # or
  BEDROCK_MODEL=us.amazon.nova-pro-v1:0
  AWS_PROFILE=
  AWS_DEFAULT_REGION=
  # or
  GOOGLE_MODEL=gemini-1.5-flash-8b
  GOOGLE_API_KEY=
  # or
  VERTEXAI_MODEL=gemini-2.0-flash-exp
  GOOGLE_CLOUD_PROJECT=
  # or
  AZURE_OPENAI_MODEL=gpt-4o-mini
  AZURE_OPENAI_API_KEY=
  AZURE_OPENAI_API_INSTANCE_NAME=
  AZURE_OPENAI_API_DEPLOYMENT_NAME=
  AZURE_OPENAI_API_VERSION=
  # or
  GROQ_MODEL=llama-3.1-8b-instant
  GROQ_API_KEY=
  # or
  COHERE_MODEL=command-r7b-12-2024
  COHERE_API_KEY=
  # or
  OLLAMA_MODEL=llama3.2
  ```

## Usage

Create a test scenario file (see below or examples directory) and run it:

```bash
npx -y aethr@latest run <your_test_file>
```

> [!NOTE]
> The default MCP tools is `@aethr/playwright-mcp` that is a patched version of `@playwright/mcp` with a few new features:
>
> - Assertion tool (`browser_assert_contain_text`)
> - Environment variable replacement (`browser_navigate`, `browser_type`)
> - Trace file output
>
> You can use any MCP tools for test automation by modifying `aethr.config.mjs` created by the first execution.

Along with the CLI output logs, you can also check Playwright Trace data for debugging:

```bash
npx -p @aethr/playwright-mcp@latest playwright show-trace ./trace.zip
```

### Example Test Scenario

Test scenario can be any text format as long as LLM can understand.
Here is an example using Markdown:

```markdown
# Test login feature

Follow the steps below.

## Steps

1. Visit ${URL}
2. Enter ${MY_USERNAME} to the Username
3. Enter ${MY_PASSWORD} to the Password
4. Click login button
5. Assert the button shows "Logout"
6. Assert "You logged into a secure area!" text exists
```

Note: `${...}` notation is replaced by the environment variables available on the CLI execution (currently it's done by MCP actually). This is useful for sensitive input like password as well as data driven tests.

## Configuration

Aethr uses `aethr.config.mjs` in the current directory as a configuration file (you can change it by `--config-file` option):

```js
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
            ...["--headless"],
            ...["--user-data-dir", "${TEMP_DIR}"], // ${TEMP_DIR} is given by Aethr per run and cleared after the run
          ],
          env: {
            FORCE_COLOR: "0", // To avoid unnecessary color codes in the assertion failure message
            TRACE: "./trace.zip", // Location to store the trace file
          },
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
```

You can tweak any configuration here.

## CI example

> [!NOTE]
> We're preparing to provide a GitHub Actions to simplify this setup. Stay tuned.

If you want to run Aethr in GitHub Actions:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: npx -p @aethr/playwright-mcp playwright install chromium --with-deps --only-shell
      - run: npx aethr run ./example/login.md
        env:
          OPENROUTER_MODEL: ${{ vars.OPENROUTER_MODEL}}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          URL: ${{ vars.URL }}
          MY_USERNAME: ${{ secrets.MY_USERNAME }}
          MY_PASSWORD: ${{ secrets.MY_PASSWORD }}
      - run: mkdir -p trace && unzip trace.zip -d trace
      - uses: actions/upload-artifact@v4
        with:
          name: trace
          path: trace
      - uses: actions/upload-artifact@v4
        with:
          name: log
          path: log
```

## Development

```bash
# Run in development mode
npm run dev -- run examples/login.test.md

# Lint code
npm run lint

# Format code
npm run format
```

## Author

Autify Inc.

## License

Apache-2.0
