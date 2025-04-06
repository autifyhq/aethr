import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { PassThrough, Transform } from "node:stream";

import { multistream, pino } from "pino";
import pretty from "pino-pretty";
import stripAnsi from "strip-ansi";

// This is a workaround for enforcing the newline when logging.
// Because token streams tends to stop in the middle of a line,
// we need to track the state of the line and add a newline if needed.
let lineFirst = true;

// This function is used to stream tokens to the console.
export const streamToken = (token: string) => {
  if (token === "") return;
  else if (token.at(-1) === "\n") lineFirst = true;
  else lineFirst = false;
  process.stdout.write(token);
};

const consoleStream = pretty({
  colorize: true,
  translateTime: "SYS:standard",
  ignore: "pid,hostname",
  singleLine: true,
  sync: true,
});

const stripAnsiFromMsg = () =>
  new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      try {
        const log = JSON.parse(chunk.toString()) as { msg: string };
        if (typeof log.msg === "string") log.msg = stripAnsi(log.msg);
        const stripped = JSON.stringify(log) + "\n";
        callback(null, stripped);
      } catch {
        // fallback if not valid JSON (shouldn't happen with pino)
        callback(null, chunk);
      }
    },
  });

const logDir = join(process.cwd(), "logs");
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const logFileId = `${timestamp}-${randomBytes(4).toString("hex")}`;

const prettyFileStream = new PassThrough();
prettyFileStream.pipe(stripAnsiFromMsg()).pipe(
  pretty({
    colorize: false,
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
    singleLine: true,
    sync: true,
    destination: join(logDir, `${logFileId}.txt`),
    mkdir: true,
  }),
);

const jsonFileStream = new PassThrough();
jsonFileStream.pipe(stripAnsiFromMsg()).pipe(
  pino.transport({
    target: "pino/file",
    options: { destination: join(logDir, `${logFileId}.jsonl`), mkdir: true },
  }),
);

const streams = multistream([
  { level: "info", stream: consoleStream },
  { level: "debug", stream: prettyFileStream },
  { level: "debug", stream: jsonFileStream },
]);

export const logger = pino({ level: "debug" }, streams);
logger.info(`Debug logs are saved in ${logDir}/${logFileId}.(txt|jsonl)`);

// This is a workaround for enforcing the newline when logging.
const originalInfo = logger.info.bind(logger);
logger.info = (...args: unknown[]) => {
  if (!lineFirst) process.stdout.write("\n");
  // @ts-expect-error Need to use unknown because the function has overloads.
  originalInfo(...args);
  lineFirst = true;
};

const originalError = logger.error.bind(logger);
logger.error = (...args: unknown[]) => {
  if (!lineFirst) process.stdout.write("\n");
  // @ts-expect-error Need to use unknown because the function has overloads.
  originalError(...args);
  lineFirst = true;
};

const originalWarn = logger.warn.bind(logger);
logger.warn = (...args: unknown[]) => {
  if (!lineFirst) process.stdout.write("\n");
  // @ts-expect-error Need to use unknown because the function has overloads.
  originalWarn(...args);
  lineFirst = true;
};

const originalDebug = logger.debug.bind(logger);
logger.debug = (...args: unknown[]) => {
  if (!lineFirst) process.stdout.write("\n");
  // @ts-expect-error Need to use unknown because the function has overloads.
  originalDebug(...args);
  lineFirst = true;
};

const originalTrace = logger.trace.bind(logger);
logger.trace = (...args: unknown[]) => {
  if (!lineFirst) process.stdout.write("\n");
  // @ts-expect-error Need to use unknown because the function has overloads.
  originalTrace(...args);
  lineFirst = true;
};

const originalFatal = logger.fatal.bind(logger);
logger.fatal = (...args: unknown[]) => {
  if (!lineFirst) process.stdout.write("\n");
  // @ts-expect-error Need to use unknown because the function has overloads.
  originalFatal(...args);
  lineFirst = true;
};

const originalLog = console.log.bind(console);
console.log = (...args: Parameters<typeof console.log>) => {
  if (!lineFirst) process.stdout.write("\n");
  originalLog(...args);
  lineFirst = true;
};

const originalErr = console.error.bind(console);
console.error = (...args: Parameters<typeof console.error>) => {
  if (!lineFirst) process.stdout.write("\n");
  originalErr(...args);
  lineFirst = true;
};
