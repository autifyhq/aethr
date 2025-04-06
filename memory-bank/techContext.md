# Technical Context: Aethr

## Technology Stack

```mermaid
graph TD
    subgraph Core
        Node[Node.js]
        TS[TypeScript]
        LC[LangChain]
        LG[LangGraph]
    end

    subgraph UI
        Pino[Pino Logger]
        Pretty[Pino-Pretty]
        Chalk[Chalk]
    end

    subgraph Automation
        Playwright[Playwright MCP]
        MCP[MCP SDK]
        Adapters[LangChain MCP Adapters]
    end

    subgraph LLM
        OpenAI[OpenAI/Azure OpenAI]
        Anthropic[Anthropic]
        Google[Google Genai/VertexAI]
        AWS[AWS Bedrock]
        Groq[Groq]
        Cohere[Cohere]
        Ollama[Ollama]
        OpenRouter[OpenRouter]
    end

    subgraph CLI
        Commander[Commander.js]
        CmdExtra[Commander Extra Typings]
        Env[Dotenv]
    end

    Core --> UI
    Core --> Automation
    Core --> LLM
    Core --> CLI
```

- **Core**: Node.js with TypeScript (strict mode), LangChain/LangGraph for ReAct agent
- **Automation**: Playwright MCP with adapters for browser control
- **UI**: Pino logger with pretty formatting and colored output
- **LLM Providers**: Multi-provider support including OpenAI, Anthropic, Google, AWS, Groq, Cohere, Ollama, and OpenRouter
- **CLI**: Commander.js with environment variable support via Dotenv

## Development Environment

- Modern Node.js runtime with TypeScript
- ESLint and Prettier for code quality
- Git hooks via Husky/lint-staged
- Vitest for testing
- ES Modules throughout

## Build Process

```mermaid
flowchart LR
    TS[TypeScript] --> Build[npm packaging]
    Build --> Exec[Executable JS]
    Exec --> Dist["./dist/index.js"]
```

- TypeScript compilation with npm packaging
- ES Modules for better tree-shaking
- Executable distribution via CLI binary

## Testing Approach

- Unit testing with Vitest (Not done yet)
- E2E testing via examples directory
- Local Playwright MCP server required for testing

## Performance Considerations

- Streaming responses for real-time feedback
- Efficient agent context management
- Asynchronous processing throughout
- Token usage tracking and optimization
- EventEmitter-based metrics collection

## Security Model

- Environment variable-based secret management
- No persistent storage of test scenario data
- Input validation for all user-provided data
- Proper error handling with detailed context

## Configuration System

```mermaid
classDiagram
    class Configuration {
        LLM Provider Selection
        Logging Configuration
        Runtime Options
    }

    class EnvironmentVariables {
        LLM API Keys
        Model Selection
        Logging Settings
        Test Variables
    }

    class CLIOptions {
        Verbosity
        Recursion Limit
        Temperature
        Tool Controls
        Config Selection
    }

    class ProfileConfig {
        MCP Settings
        Default Options
    }

    Configuration --> EnvironmentVariables
    Configuration --> CLIOptions
    Configuration --> ProfileConfig
```

## Environment Variables

- LLM API keys and model selection for all providers
- Logging configuration
- Test scenario variable substitution

## CLI Options

- Verbosity control
- Recursion limit for agent
- Temperature adjustment for LLM
- Think-tool and reasoning parameter toggles
- Configuration file and profile selection

## External Dependencies

- **LLM APIs**: Multiple providers with varying rate limits and pricing
- **Browser Automation**: Playwright MCP for reliable control
- **Runtime Environment**: Node.js v22+ required

## Key Constraints

- API latency affects performance
- Browser automation timing challenges
- Environment variable management complexity
- Natural language interpretation limitations
